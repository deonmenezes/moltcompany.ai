'use client'

import Image from 'next/image'

interface CompanionCardProps {
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
    companion_name: string | null
    companion_role: string | null
    companion_color: string | null
    companion_avatar: string | null
  }
  onAction: (instanceId: string, action: 'start' | 'stop' | 'terminate') => void
  actionLoading: string | null
}

const statusConfig: Record<string, { dot: string; label: string; bg: string }> = {
  running: { dot: 'bg-green-500', label: 'ONLINE', bg: 'bg-green-50' },
  provisioning: { dot: 'bg-yellow-500 animate-pulse', label: 'DEPLOYING', bg: 'bg-yellow-50' },
  stopped: { dot: 'bg-gray-500', label: 'STOPPED', bg: 'bg-gray-50' },
  failed: { dot: 'bg-red-500', label: 'FAILED', bg: 'bg-red-50' },
  payment_failed: { dot: 'bg-red-500', label: 'PAYMENT FAILED', bg: 'bg-red-50' },
  terminated: { dot: 'bg-gray-700', label: 'TERMINATED', bg: 'bg-gray-100' },
  pending_payment: { dot: 'bg-yellow-500', label: 'PENDING', bg: 'bg-yellow-50' },
}

function formatModel(modelName: string | null): string {
  if (!modelName) return 'N/A'
  // Strip provider prefix: "anthropic/claude-opus-4-5" -> "claude-opus-4-5"
  const parts = modelName.split('/')
  return parts.length > 1 ? parts[1] : modelName
}

export function CompanionCard({ instance, onAction, actionLoading }: CompanionCardProps) {
  const status = statusConfig[instance.status] || { dot: 'bg-gray-500', label: instance.status.toUpperCase(), bg: 'bg-gray-50' }
  const color = instance.companion_color || '#FFD600'
  const isLoading = actionLoading === instance.id
  const name = instance.companion_name || 'Companion'
  const role = instance.companion_role || 'AI Assistant'

  return (
    <div className="comic-card overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className="h-2" style={{ backgroundColor: color }} />

      {/* Header: Avatar + Name + Status */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full border-3 border-black flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${color}20` }}
          >
            {instance.companion_avatar ? (
              <Image
                src={instance.companion_avatar}
                alt={name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-display font-black" style={{ color }}>
                {name.charAt(0)}
              </span>
            )}
          </div>

          {/* Name + Role */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-black text-lg uppercase tracking-tight leading-tight truncate">
              {name}
            </h3>
            <span
              className="inline-block text-[10px] font-display font-bold uppercase px-2 py-0.5 mt-1 border-2 border-black"
              style={{ backgroundColor: `${color}30`, color: '#000' }}
            >
              {role}
            </span>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm ${status.bg} flex-shrink-0`}>
            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span className="text-[10px] font-display font-bold uppercase">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Model</div>
          <div className="text-xs text-black font-mono truncate">{formatModel(instance.model_name)}</div>
        </div>
        <div>
          <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Region</div>
          <div className="text-xs text-black">{instance.region}</div>
        </div>
        <div>
          <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">IP</div>
          <div className="text-xs text-black font-mono">{instance.public_ip || 'Assigning...'}</div>
        </div>
        <div>
          <div className="text-[10px] text-brand-gray-medium font-display font-bold uppercase">Created</div>
          <div className="text-xs text-black">{new Date(instance.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Gateway token (collapsible feel) */}
      {instance.gateway_token && (
        <div className="mx-5 mb-4 p-3 border-2 border-dashed border-brand-gray-medium/30 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-display font-bold uppercase text-brand-gray-medium mb-0.5">UI Password</div>
              <code className="text-[11px] text-black font-mono block truncate">{instance.gateway_token}</code>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(instance.gateway_token!)}
              className="text-[10px] font-display font-bold uppercase px-2 py-1 border-2 border-black hover:bg-brand-yellow transition flex-shrink-0"
            >
              COPY
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto border-t-3 border-black px-5 py-3 flex flex-wrap gap-2">
        {instance.public_ip && instance.status === 'running' && (
          <a
            href={`http://${instance.public_ip}:8080?token=${instance.gateway_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="comic-btn text-xs py-1.5 px-3"
          >
            OPEN UI
          </a>
        )}
        {instance.status === 'running' && (
          <button
            onClick={() => onAction(instance.id, 'stop')}
            disabled={isLoading}
            className="comic-btn-outline text-xs py-1.5 px-3 disabled:opacity-50"
          >
            {isLoading ? '...' : 'STOP'}
          </button>
        )}
        {instance.status === 'stopped' && (
          <button
            onClick={() => onAction(instance.id, 'start')}
            disabled={isLoading}
            className="comic-btn text-xs py-1.5 px-3 disabled:opacity-50"
          >
            {isLoading ? '...' : 'RESTART'}
          </button>
        )}
        {['running', 'stopped', 'provisioning'].includes(instance.status) && (
          <button
            onClick={() => {
              if (confirm(`Terminate ${name}? This will permanently delete this companion and all its data.`)) {
                onAction(instance.id, 'terminate')
              }
            }}
            disabled={isLoading}
            className="ml-auto text-xs py-1.5 px-3 border-3 border-red-500 text-red-500 font-display font-bold uppercase shadow-comic-sm hover:bg-red-50 transition disabled:opacity-50"
          >
            {isLoading ? '...' : 'TERMINATE'}
          </button>
        )}
      </div>
    </div>
  )
}
