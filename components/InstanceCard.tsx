'use client'

interface InstanceCardProps {
  instance: {
    id: string
    status: string
    public_ip: string | null
    model_provider: string | null
    model_name: string | null
    channel: string
    gateway_token: string | null
    region: string
    created_at: string
    ec2_instance_id: string | null
  }
  onAction: (action: 'start' | 'stop' | 'terminate') => void
  actionLoading: boolean
}

const statusColors: Record<string, string> = {
  running: 'bg-green-500',
  provisioning: 'bg-yellow-500 animate-pulse',
  stopped: 'bg-gray-500',
  failed: 'bg-red-500',
  payment_failed: 'bg-red-500',
  terminated: 'bg-gray-700',
  pending_payment: 'bg-yellow-500',
}

export function InstanceCard({ instance, onAction, actionLoading }: InstanceCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-dark-card border border-dark-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Your OpenClaw Instance</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[instance.status] || 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400 capitalize">{instance.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Public IP</div>
          <div className="text-sm text-white font-mono">
            {instance.public_ip || 'Assigning...'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Region</div>
          <div className="text-sm text-white">{instance.region}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Model</div>
          <div className="text-sm text-white">{instance.model_name || 'N/A'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Channel</div>
          <div className="text-sm text-white capitalize">{instance.channel}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Instance ID</div>
          <div className="text-sm text-white font-mono text-xs">
            {instance.ec2_instance_id || 'Pending'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Created</div>
          <div className="text-sm text-white">
            {new Date(instance.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {instance.gateway_token && (
        <div className="mt-4 p-4 rounded-lg bg-dark-bg border border-accent-blue/30">
          <div className="text-xs text-gray-500 mb-2">Gateway Token / Web UI Password</div>
          <div className="flex items-center gap-2">
            <code className="text-sm text-accent-blue font-mono flex-1 break-all">
              {instance.gateway_token}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(instance.gateway_token!)}
              className="px-3 py-1 text-xs rounded bg-dark-card hover:bg-gray-700 transition"
            >
              Copy
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Use this as the password when logging into OpenClaw (username: admin)
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {instance.public_ip && instance.status === 'running' && (
          <a
            href={`http://${instance.public_ip}:8080`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-purple text-sm font-medium hover:opacity-90 transition"
          >
            Open Control UI
          </a>
        )}
        {instance.status === 'running' && (
          <button
            onClick={() => onAction('stop')}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg border border-dark-border text-sm text-gray-400 hover:text-white hover:border-gray-500 transition disabled:opacity-50"
          >
            {actionLoading ? 'Stopping...' : 'Stop'}
          </button>
        )}
        {instance.status === 'stopped' && (
          <button
            onClick={() => onAction('start')}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg border border-accent-blue text-sm text-accent-blue hover:bg-accent-blue/10 transition disabled:opacity-50"
          >
            {actionLoading ? 'Starting...' : 'Restart'}
          </button>
        )}
        {(instance.status === 'running' || instance.status === 'stopped' || instance.status === 'provisioning') && (
          <button
            onClick={() => {
              if (confirm('Are you sure? This will permanently delete the instance and all data.')) {
                onAction('terminate')
              }
            }}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg border border-red-500 text-sm text-red-500 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            {actionLoading ? 'Terminating...' : 'Terminate'}
          </button>
        )}
      </div>
    </div>
  )
}
