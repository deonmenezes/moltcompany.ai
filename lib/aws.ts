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
        {
          IpProtocol: 'tcp',
          FromPort: 3978,
          ToPort: 3978,
          IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'Teams Bot Framework webhook' }],
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
  telegramToken = '',
  gatewayToken,
  characterFiles,
  extraEnvVars,
  bedrockCredentials,
  channel = 'telegram',
  teamsCredentials,
}: {
  userId: string
  modelProvider: string
  modelName: string
  apiKey: string
  telegramToken?: string
  gatewayToken: string
  characterFiles?: Record<string, string>
  extraEnvVars?: Record<string, string>
  bedrockCredentials?: { accessKeyId: string; secretAccessKey: string; region: string }
  channel?: string
  teamsCredentials?: { appId: string; appPassword: string }
  whatsappCredentials?: { phoneNumberId: string; accessToken: string }
}) {
  const sgId = await getOrCreateSecurityGroup()
  const customAmiId = process.env.OPENCLAW_AMI_ID
  const amiId = customAmiId || await getUbuntuAmi()

  const apiKeyEnvVar = MODEL_ENV_MAP[modelProvider] || 'ANTHROPIC_API_KEY'
  // Bedrock passes AWS creds as env vars (required by entrypoint check) + credentials file as fallback
  const apiKeyLine = bedrockCredentials
    ? ''
    : `  -e ${apiKeyEnvVar}="${apiKey}" \\\n`

  // Build extra env var flags for Docker
  const extraEnvFlags = Object.entries(extraEnvVars || {})
    .map(([k, v]) => `-e ${k}="${v}"`)
    .join(' \\\n  ')

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

  // Build AWS credentials file commands (for Bedrock — avoids env var detection bug)
  const awsCredsSetup = bedrockCredentials ? `
# Create AWS credentials file for Bedrock (NOT env vars — avoids OpenClaw discovery bug)
mkdir -p /opt/aws-creds
cat > /opt/aws-creds/credentials <<AWSEOF
[default]
aws_access_key_id = ${bedrockCredentials.accessKeyId}
aws_secret_access_key = ${bedrockCredentials.secretAccessKey}
AWSEOF
cat > /opt/aws-creds/config <<AWSEOF
[default]
region = ${bedrockCredentials.region}
AWSEOF
chmod 600 /opt/aws-creds/credentials
` : ''

  // Docker flags: AWS env vars (required by entrypoint) + credentials file mount
  const awsCredsDockerFlags = bedrockCredentials
    ? `  -v /opt/aws-creds:/aws-creds:ro \\\n  -e AWS_SHARED_CREDENTIALS_FILE=/aws-creds/credentials \\\n  -e AWS_CONFIG_FILE=/aws-creds/config \\\n  -e AWS_ACCESS_KEY_ID="${bedrockCredentials.accessKeyId}" \\\n  -e AWS_SECRET_ACCESS_KEY="${bedrockCredentials.secretAccessKey}" \\\n  -e AWS_REGION="${bedrockCredentials.region}" \\\n`
    : ''

  // Channel-specific: Telegram env vars for Docker (only when telegram)
  const telegramDockerEnvVars = channel === 'telegram'
    ? `  -e TELEGRAM_BOT_TOKEN="${telegramToken}" \\\n  -e TELEGRAM_DM_POLICY=open \\\n  -e TELEGRAM_ALLOW_FROM='*' \\\n  -e TELEGRAM_ACTIONS_REACTIONS=true \\\n  -e TELEGRAM_ACTIONS_STICKER=true \\\n`
    : ''

  // Channel-specific: openclaw.json plugins section
  // Telegram uses native OpenClaw plugin; Teams and WhatsApp use central webhooks (no plugin needed)
  const pluginsConfig = channel === 'telegram'
    ? `"plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }`
    : `"plugins": {
    "entries": {}
  }`

  // Channel-specific: Teams bridge setup (inline Node.js service on EC2)
  const teamsBridgeSetup = channel === 'teams' && teamsCredentials ? `
# --- Teams Bridge Setup ---
# Install Node.js 20.x for the Teams bridge service
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

mkdir -p /opt/teams-bridge
cat > /opt/teams-bridge/package.json <<'BRIDGEPKGEOF'
{"name":"teams-bridge","version":"1.0.0","main":"index.js","dependencies":{"botbuilder":"^4.23.1","botframework-connector":"^4.23.1","express":"^4.21.0"}}
BRIDGEPKGEOF

cat > /opt/teams-bridge/index.js <<'BRIDGEJSEOF'
const{CloudAdapter,ConfigurationBotFrameworkAuthentication,ActivityTypes}=require("botbuilder"),express=require("express");
const PORT=parseInt(process.env.BRIDGE_PORT||"3978",10);
const GW=process.env.OPENCLAW_GATEWAY_URL||"http://localhost:8080";
const GW_TOKEN=process.env.OPENCLAW_GATEWAY_TOKEN||"";
const AID=process.env.MICROSOFT_APP_ID||"";
const auth=new ConfigurationBotFrameworkAuthentication(AID?{MicrosoftAppId:AID,MicrosoftAppPassword:process.env.MICROSOFT_APP_PASSWORD||"",MicrosoftAppType:"SingleTenant"}:{});
const adapter=new CloudAdapter(auth);
adapter.onTurnError=async(ctx,err)=>{console.error("[TeamsBot] Error:",err);await ctx.sendActivity("Sorry, something went wrong.")};
async function chat(text,userId,convId){const r=await fetch(GW+"/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",...(GW_TOKEN?{Authorization:"Bearer "+GW_TOKEN}:{})},body:JSON.stringify({model:"default",messages:[{role:"user",content:text}],user:userId,metadata:{conversationId:convId,source:"teams"}})});if(!r.ok)throw new Error("Gateway "+r.status);const d=await r.json();return d.choices?.[0]?.message?.content||d.response||"No response."}
async function onMsg(ctx){if(ctx.activity.type!==ActivityTypes.Message)return;const txt=ctx.activity.text||"";if(!txt.trim())return;const uid=ctx.activity.from?.id||"unknown",cid=ctx.activity.conversation?.id||"unknown";console.log("[TeamsBot] From "+uid+": "+txt.substring(0,100));await ctx.sendActivity({type:ActivityTypes.Typing});try{const reply=await chat(txt,uid,cid);await ctx.sendActivity(reply)}catch(e){console.error("[TeamsBot] Gateway error:",e.message);await ctx.sendActivity("Having trouble connecting. Try again shortly.")}}
const app=express();
app.use(express.json());
app.get("/health",(q,s)=>s.json({status:"ok"}));
app.post("/api/messages",async(q,s)=>{try{await adapter.process(q,s,onMsg)}catch(e){console.error(e);if(!s.headersSent)s.status(500).send()}});
app.listen(PORT,()=>console.log("[TeamsBot] Bridge on port "+PORT));
BRIDGEJSEOF

cd /opt/teams-bridge && npm install --production

# Start Teams bridge as a background service
MICROSOFT_APP_ID="${teamsCredentials.appId}" \\
MICROSOFT_APP_PASSWORD="${teamsCredentials.appPassword}" \\
OPENCLAW_GATEWAY_URL="http://localhost:8080" \\
OPENCLAW_GATEWAY_TOKEN="${gatewayToken}" \\
nohup node /opt/teams-bridge/index.js > /var/log/teams-bridge.log 2>&1 &

# Open port 3978 for Teams Bot Framework webhook (in addition to 8080)
# Note: For production, use Caddy or nginx with SSL in front of port 3978
` : ''

  // Channel-specific: post-launch loop
  const postLaunchLoop = channel === 'telegram'
    ? `# Keep fixing until the container stays up (configure may overwrite on restarts)
(
  for attempt in $(seq 1 10); do
    sleep 15
    echo "Fix attempt $attempt: correcting providerFilter..."
    docker run --rm -v openclaw-data:/data -v /opt/fix-bedrock.sh:/fix.sh:ro alpine /fix.sh
    sleep 20
    if docker exec openclaw openclaw --version >/dev/null 2>&1; then
      echo "OpenClaw is running! Linking Telegram..."
      sleep 15
      docker exec openclaw openclaw telegram link "${telegramToken}" || true
      echo "Telegram link complete."
      break
    fi
    echo "Container not ready yet, retrying..."
  done
) &`
    : `# Wait for OpenClaw to be ready (${channel === 'teams' ? 'Teams bridge' : 'WhatsApp webhook'} connects via HTTP, no telegram link needed)
(
  for attempt in $(seq 1 10); do
    sleep 15
    echo "Fix attempt $attempt: correcting providerFilter..."
    docker run --rm -v openclaw-data:/data -v /opt/fix-bedrock.sh:/fix.sh:ro alpine /fix.sh
    sleep 20
    if docker exec openclaw openclaw --version >/dev/null 2>&1; then
      echo "OpenClaw is running! Gateway ready for ${channel} messages."
      break
    fi
    echo "Container not ready yet, retrying..."
  done
) &`

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

${awsCredsSetup}
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
  ${pluginsConfig}${bedrockCredentials ? `,
  "models": {
    "bedrockDiscovery": {
      "enabled": true,
      "region": "${bedrockCredentials.region}",
      "providerFilter": ["amazon"]
    }
  }` : ''}
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
${awsCredsDockerFlags}  -e BROWSER_CDP_URL=http://browser:9223 \
  -e BROWSER_DEFAULT_PROFILE=openclaw \
  -e BROWSER_EVALUATE_ENABLED=true \
${apiKeyLine}${telegramDockerEnvVars}  -e OPENCLAW_PRIMARY_MODEL="${modelName}" \
  -e OPENCLAW_GATEWAY_TOKEN="${gatewayToken}" \\
${extraEnvFlags ? '  ' + extraEnvFlags + ' \\\n' : ''}  coollabsio/openclaw:latest

# Create fix script for OpenClaw bedrockDiscovery bug (providerFilter must be array)
cat > /opt/fix-bedrock.sh <<'FIXEOF'
#!/bin/sh
sed -i 's/"providerFilter": "\\([^"]*\\)"/"providerFilter": ["\\1"]/' /data/.openclaw/openclaw.json 2>/dev/null || true
FIXEOF
chmod +x /opt/fix-bedrock.sh

${teamsBridgeSetup}
${postLaunchLoop}
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
