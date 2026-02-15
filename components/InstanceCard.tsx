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
    <div className="comic-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="comic-heading text-lg">Your OpenClaw Instance</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[instance.status] || 'bg-gray-500'}`} />
          <span className="text-sm font-display font-bold uppercase text-brand-gray-dark">
            {instance.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Public IP</div>
          <div className="text-sm text-black font-mono">{instance.public_ip || 'Assigning...'}</div>
        </div>
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Region</div>
          <div className="text-sm text-black">{instance.region}</div>
        </div>
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Model</div>
          <div className="text-sm text-black">{instance.model_name || 'N/A'}</div>
        </div>
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Channel</div>
          <div className="text-sm text-black capitalize">{instance.channel}</div>
        </div>
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Instance ID</div>
          <div className="text-sm text-black font-mono text-xs">{instance.ec2_instance_id || 'Pending'}</div>
        </div>
        <div>
          <div className="text-xs text-brand-gray-medium font-display font-bold uppercase mb-1">Created</div>
          <div className="text-sm text-black">{new Date(instance.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {instance.gateway_token && (
        <div className="mt-4 p-4 bg-brand-yellow border-3 border-black">
          <div className="text-xs font-display font-bold uppercase mb-2">Gateway Token / Web UI Password</div>
          <div className="flex items-center gap-2">
            <code className="text-sm text-black font-mono flex-1 break-all">{instance.gateway_token}</code>
            <button
              onClick={() => navigator.clipboard.writeText(instance.gateway_token!)}
              className="comic-btn-outline px-3 py-1 text-xs"
            >
              COPY
            </button>
          </div>
          <div className="text-xs text-brand-gray-dark mt-2">
            Use this as the password when logging into OpenClaw (username: admin)
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        {instance.public_ip && instance.status === 'running' && (
          <a
            href={`http://${instance.public_ip}:8080?token=${instance.gateway_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="comic-btn text-sm py-2 px-4"
          >
            OPEN CONTROL UI
          </a>
        )}
        {instance.status === 'running' && (
          <button
            onClick={() => onAction('stop')}
            disabled={actionLoading}
            className="comic-btn-outline text-sm py-2 px-4 disabled:opacity-50"
          >
            {actionLoading ? 'STOPPING...' : 'STOP'}
          </button>
        )}
        {instance.status === 'stopped' && (
          <button
            onClick={() => onAction('start')}
            disabled={actionLoading}
            className="comic-btn text-sm py-2 px-4 disabled:opacity-50"
          >
            {actionLoading ? 'STARTING...' : 'RESTART'}
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
            className="px-4 py-2 border-3 border-red-500 text-red-500 font-display font-bold uppercase text-sm shadow-comic-sm hover:bg-red-50 transition disabled:opacity-50"
          >
            {actionLoading ? 'TERMINATING...' : 'TERMINATE'}
          </button>
        )}
      </div>
    </div>
  )
}
