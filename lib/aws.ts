import {
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  DescribeSecurityGroupsCommand,
  DescribeImagesCommand,
} from '@aws-sdk/client-ec2'

const ec2 = new EC2Client({ region: process.env.AWS_REGION || 'ap-south-1' })

const MODEL_ENV_MAP: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  google: 'GEMINI_API_KEY',
  kimi: 'MOONSHOT_API_KEY',
  minimax: 'MINIMAX_API_KEY',
}

async function getOrCreateSecurityGroup(): Promise<string> {
  const sgName = 'openclaw-platform-sg'

  try {
    const desc = await ec2.send(
      new DescribeSecurityGroupsCommand({
        Filters: [{ Name: 'group-name', Values: [sgName] }],
      })
    )
    if (desc.SecurityGroups && desc.SecurityGroups.length > 0) {
      return desc.SecurityGroups[0].GroupId!
    }
  } catch {
    // doesn't exist, create it
  }

  const createRes = await ec2.send(
    new CreateSecurityGroupCommand({
      GroupName: sgName,
      Description: 'OpenClaw managed instances - allows 8080 inbound',
    })
  )

  const groupId = createRes.GroupId!

  await ec2.send(
    new AuthorizeSecurityGroupIngressCommand({
      GroupId: groupId,
      IpPermissions: [
        {
          IpProtocol: 'tcp',
          FromPort: 8080,
          ToPort: 8080,
          IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'OpenClaw UI' }],
        },
      ],
    })
  )

  return groupId
}

async function getUbuntuAmi(): Promise<string> {
  const res = await ec2.send(
    new DescribeImagesCommand({
      Filters: [
        { Name: 'name', Values: ['ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*'] },
        { Name: 'state', Values: ['available'] },
      ],
      Owners: ['099720109477'],
    })
  )

  const images = res.Images || []
  images.sort((a, b) => (b.CreationDate || '').localeCompare(a.CreationDate || ''))

  if (images.length === 0) {
    throw new Error('No Ubuntu 24.04 AMI found in ' + (process.env.AWS_REGION || 'ap-south-1'))
  }

  return images[0].ImageId!
}

export async function launchInstance({
  userId,
  modelProvider,
  modelName,
  apiKey,
  telegramToken,
  gatewayToken,
  characterFiles,
}: {
  userId: string
  modelProvider: string
  modelName: string
  apiKey: string
  telegramToken: string
  gatewayToken: string
  characterFiles?: Record<string, string>
}) {
  const sgId = await getOrCreateSecurityGroup()
  const customAmiId = process.env.OPENCLAW_AMI_ID
  const amiId = customAmiId || await getUbuntuAmi()

  const apiKeyEnvVar = MODEL_ENV_MAP[modelProvider] || 'ANTHROPIC_API_KEY'

  // Build base64-encoded write commands for character .md files
  let characterFileCommands = ''
  if (characterFiles) {
    for (const [name, content] of Object.entries(characterFiles)) {
      if (content) {
        const b64 = Buffer.from(content).toString('base64')
        characterFileCommands += `echo "${b64}" | base64 -d > /opt/openclaw-config/${name}.md\n`
      }
    }
  }

  // Custom AMI has Docker + image pre-installed, just start Docker and run container
  // Fallback to base Ubuntu AMI installs Docker first
  const setupCommands = customAmiId
    ? `systemctl start docker
`
    : `apt-get update && apt-get install -y docker.io
systemctl enable docker && systemctl start docker
`

  const userData = Buffer.from(`#!/bin/bash
set -e
${setupCommands}
# Create Docker network for openclaw + browser sidecar
docker network create openclaw-net

# Get public IP via IMDSv2 (with IMDSv1 fallback)
IMDS_TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 300" || echo "")
if [ -n "$IMDS_TOKEN" ]; then
  PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $IMDS_TOKEN" \
    http://169.254.169.254/latest/meta-data/public-ipv4 || echo "")
else
  PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "")
fi

# Create openclaw config for public IP access
mkdir -p /opt/openclaw-config
cat > /opt/openclaw-config/openclaw.json <<CONFIGEOF
{
  "gateway": {
    "trustedProxies": ["0.0.0.0/0"],
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": true,
      "dangerouslyDisableDeviceAuth": true,
      "allowedOrigins": ["http://\${PUBLIC_IP}:8080", "http://localhost:8080", "*"]
    },
    "auth": {
      "mode": "token"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
CONFIGEOF

# Write character .md files
${characterFileCommands}
# Create data volume and seed the config into it (where openclaw reads from)
docker volume create openclaw-data
docker run --rm -v openclaw-data:/data -v /opt/openclaw-config:/config alpine sh -c '
  mkdir -p /data/.openclaw
  mkdir -p /data/workspace
  cp /config/openclaw.json /data/.openclaw/openclaw.json
  ls /config/*.md 2>/dev/null && cp /config/*.md /data/workspace/ || true
  chown -R 1000:1000 /data/.openclaw
  chown -R 1000:1000 /data/workspace
'

# Start browser sidecar container (required for openclaw)
docker run -d \
  --name browser \
  --network openclaw-net \
  --restart unless-stopped \
  --shm-size=2g \
  -v browser-data:/config \
  coollabsio/openclaw-browser:latest

# Start openclaw main container
docker run -d \
  --name openclaw \
  --network openclaw-net \
  --restart unless-stopped \
  -p 8080:8080 \
  -v openclaw-data:/data \
  -e BROWSER_CDP_URL=http://browser:9223 \
  -e BROWSER_DEFAULT_PROFILE=openclaw \
  -e BROWSER_EVALUATE_ENABLED=true \
  -e ${apiKeyEnvVar}="${apiKey}" \
  -e TELEGRAM_BOT_TOKEN="${telegramToken}" \
  -e TELEGRAM_DM_POLICY=open \
  -e TELEGRAM_ALLOW_FROM='*' \
  -e TELEGRAM_ACTIONS_REACTIONS=true \
  -e TELEGRAM_ACTIONS_STICKER=true \
  -e OPENCLAW_PRIMARY_MODEL="${modelName}" \
  -e OPENCLAW_GATEWAY_TOKEN="${gatewayToken}" \
  coollabsio/openclaw:latest

# Wait for openclaw container to be ready, then link Telegram bot
(
  echo "Waiting for openclaw container to be ready..."
  for i in $(seq 1 60); do
    if docker exec openclaw openclaw --version >/dev/null 2>&1; then
      echo "OpenClaw is ready, linking Telegram..."
      sleep 15
      docker exec openclaw openclaw telegram link "${telegramToken}" || true
      echo "Telegram link complete."
      break
    fi
    echo "Attempt $i/60 - waiting 5s..."
    sleep 5
  done
) &
`).toString('base64')

  const res = await ec2.send(
    new RunInstancesCommand({
      ImageId: amiId,
      InstanceType: 'm7i-flex.large',
      MinCount: 1,
      MaxCount: 1,
      SecurityGroupIds: [sgId],
      UserData: userData,
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/sda1',
          Ebs: {
            VolumeSize: 20, // 20GB root volume (openclaw + browser images need ~6-7GB)
            VolumeType: 'gp3',
            DeleteOnTermination: true,
          },
        },
      ],
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            { Key: 'Name', Value: `moltcompany-${userId.slice(0, 8)}` },
            { Key: 'ManagedBy', Value: 'moltcompany-platform' },
            { Key: 'UserId', Value: userId },
          ],
        },
      ],
    })
  )

  const instanceId = res.Instances?.[0]?.InstanceId
  if (!instanceId) throw new Error('Failed to launch EC2 instance')

  return { instanceId }
}

export async function getInstancePublicIp(instanceId: string): Promise<string | null> {
  const res = await ec2.send(
    new DescribeInstancesCommand({ InstanceIds: [instanceId] })
  )
  return res.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress || null
}

export async function getInstanceState(instanceId: string): Promise<string> {
  const res = await ec2.send(
    new DescribeInstancesCommand({ InstanceIds: [instanceId] })
  )
  return res.Reservations?.[0]?.Instances?.[0]?.State?.Name || 'unknown'
}

export async function stopInstance(instanceId: string) {
  await ec2.send(new StopInstancesCommand({ InstanceIds: [instanceId] }))
}

export async function startInstance(instanceId: string) {
  await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] }))
}

export async function terminateInstance(instanceId: string) {
  await ec2.send(new TerminateInstancesCommand({ InstanceIds: [instanceId] }))
}
