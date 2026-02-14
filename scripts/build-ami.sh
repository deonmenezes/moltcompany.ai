#!/bin/bash
# Build a custom AMI with Docker + OpenClaw image pre-installed
# Usage: bash scripts/build-ami.sh
# Requires: AWS CLI configured with ap-south-1 region

set -euo pipefail

REGION="ap-south-1"
INSTANCE_TYPE="t3.medium"
AMI_NAME="openclaw-base-$(date +%Y-%m-%d-%H%M)"

echo "==> Finding latest Ubuntu 24.04 AMI in ${REGION}..."
BASE_AMI=$(aws ec2 describe-images \
  --region "$REGION" \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text)

if [ "$BASE_AMI" = "None" ] || [ -z "$BASE_AMI" ]; then
  echo "ERROR: No Ubuntu 24.04 AMI found in ${REGION}"
  exit 1
fi
echo "    Base AMI: ${BASE_AMI}"

# User-data script to install Docker and pull OpenClaw image
USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
set -e

# Install Docker
apt-get update
apt-get install -y docker.io
systemctl enable docker
systemctl start docker

# Pull OpenClaw images (main + browser sidecar)
docker pull coollabsio/openclaw:latest
docker pull coollabsio/openclaw-browser:latest

# Create data directories
mkdir -p /opt/openclaw/config /opt/openclaw/workspace

# Signal that setup is complete
touch /tmp/openclaw-ami-ready
USERDATA
)

USER_DATA_B64=$(echo "$USER_DATA" | base64 -w 0 2>/dev/null || echo "$USER_DATA" | base64)

echo "==> Launching temporary instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --region "$REGION" \
  --image-id "$BASE_AMI" \
  --instance-type "$INSTANCE_TYPE" \
  --block-device-mappings "DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3,DeleteOnTermination=true}" \
  --user-data "$USER_DATA_B64" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=openclaw-ami-builder},{Key=Purpose,Value=ami-build}]" \
  --query "Instances[0].InstanceId" \
  --output text)

echo "    Instance ID: ${INSTANCE_ID}"

echo "==> Waiting for instance to be running..."
aws ec2 wait instance-running --region "$REGION" --instance-ids "$INSTANCE_ID"
echo "    Instance is running."

echo "==> Waiting for instance status checks to pass..."
aws ec2 wait instance-status-ok --region "$REGION" --instance-ids "$INSTANCE_ID"
echo "    Status checks passed."

# Wait for user-data to finish (Docker install + both image pulls take ~4-5 min)
echo "==> Waiting 300 seconds for Docker install and OpenClaw image pulls..."
sleep 300

echo "==> Stopping instance before creating AMI..."
aws ec2 stop-instances --region "$REGION" --instance-ids "$INSTANCE_ID" > /dev/null
aws ec2 wait instance-stopped --region "$REGION" --instance-ids "$INSTANCE_ID"
echo "    Instance stopped."

echo "==> Creating AMI: ${AMI_NAME}..."
AMI_ID=$(aws ec2 create-image \
  --region "$REGION" \
  --instance-id "$INSTANCE_ID" \
  --name "$AMI_NAME" \
  --description "Ubuntu 24.04 with Docker and coollabsio/openclaw:latest pre-installed" \
  --no-reboot \
  --query "ImageId" \
  --output text)

echo "    AMI ID: ${AMI_ID}"

echo "==> Waiting for AMI to become available (this may take a few minutes)..."
aws ec2 wait image-available --region "$REGION" --image-ids "$AMI_ID"
echo "    AMI is ready!"

echo "==> Terminating temporary builder instance..."
aws ec2 terminate-instances --region "$REGION" --instance-ids "$INSTANCE_ID" > /dev/null
echo "    Builder instance terminated."

echo ""
echo "============================================"
echo "  Custom AMI created successfully!"
echo "  AMI ID: ${AMI_ID}"
echo "  Region: ${REGION}"
echo ""
echo "  Add this to your .env.local:"
echo "  OPENCLAW_AMI_ID=${AMI_ID}"
echo "============================================"
