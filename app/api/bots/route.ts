import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bots as officialBots } from '@/lib/bots'

export type UnifiedBot = {
  id: string
  name: string
  role: string | null
  description: string
  avatar: string | null
  color: string
  category: string
  creator: string
  isOfficial: boolean
  likeCount: number
  viewCount: number
  deployCount: number
  createdAt: string
  tags?: string[]
  href: string
}

export async function GET(req: NextRequest) {
  try {
    const sort = req.nextUrl.searchParams.get('sort') || 'trending'
    const search = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase()
    const category = req.nextUrl.searchParams.get('category') || 'all'
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '30') || 30, 100)
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0') || 0

    // Get like counts grouped by bot_id
    const { data: likeRows } = await supabase
      .from('bot_likes')
      .select('bot_id')

    const likeMap: Record<string, number> = {}
    ;(likeRows || []).forEach(row => {
      likeMap[row.bot_id] = (likeMap[row.bot_id] || 0) + 1
    })

    // Build official bots
    const officialUnified: UnifiedBot[] = officialBots.map(b => ({
      id: b.id,
      name: b.characterName,
      role: b.characterRole,
      description: b.tagline,
      avatar: b.avatar,
      color: b.color,
      category: b.category,
      creator: 'OFFICIAL',
      isOfficial: true,
      likeCount: likeMap[b.id] || 0,
      viewCount: 0,
      deployCount: 0,
      createdAt: '2025-01-01T00:00:00Z',
      href: `/deploy?model=${b.id}`,
    }))

    // Fetch community bots
    let query = supabase
      .from('community_bots')
      .select('id, name, bot_name, description, icon_url, author_name, role, color, category, tags, view_count, deploy_count, created_at')
      .eq('status', 'published')

    const { data: communityData } = await query

    const communityUnified: UnifiedBot[] = (communityData || []).map(b => ({
      id: `community-${b.id}`,
      name: (b.name || b.bot_name || 'Unnamed').toUpperCase(),
      role: b.role || null,
      description: b.description || 'A community-created AI companion',
      avatar: b.icon_url,
      color: b.color || '#8B5CF6',
      category: b.category || 'other',
      creator: b.author_name || 'Anonymous',
      isOfficial: false,
      likeCount: likeMap[`community-${b.id}`] || 0,
      viewCount: b.view_count || 0,
      deployCount: b.deploy_count || 0,
      createdAt: b.created_at,
      tags: b.tags,
      href: `/companions/community/${b.id}`,
    }))

    // Merge
    let all = [...officialUnified, ...communityUnified]

    // Filter by category
    if (category && category !== 'all') {
      all = all.filter(b => b.category === category)
    }

    // Filter by search
    if (search) {
      all = all.filter(b =>
        b.name.toLowerCase().includes(search) ||
        (b.role || '').toLowerCase().includes(search) ||
        b.description.toLowerCase().includes(search) ||
        b.creator.toLowerCase().includes(search)
      )
    }

    // Sort
    switch (sort) {
      case 'most_liked':
        all.sort((a, b) => b.likeCount - a.likeCount)
        break
      case 'newest':
        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'most_deployed':
        all.sort((a, b) => b.deployCount - a.deployCount)
        break
      case 'trending':
      default:
        // Official bots first, then by likes
        all.sort((a, b) => {
          if (a.isOfficial !== b.isOfficial) return a.isOfficial ? -1 : 1
          return b.likeCount - a.likeCount
        })
        break
    }

    // Paginate
    const total = all.length
    const paged = all.slice(offset, offset + limit)

    return NextResponse.json({ bots: paged, total })
  } catch (err) {
    console.error('Bots list error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
