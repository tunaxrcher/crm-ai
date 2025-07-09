'use client'

import { Badge } from '@src/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@src/components/ui/card'
import { ScrollArea } from '@src/components/ui/scroll-area'
import { Skeleton } from '@src/components/ui/skeleton'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Crown, Trophy, User } from 'lucide-react'

import { useJackpotWinners } from '../hooks/api'

export default function JackpotWinnersSection() {
  const { data: winnersData, isLoading } = useJackpotWinners(10)

  return (
    <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Crown className="h-5 w-5" />
          🏆 ผู้โชคดี Jackpot
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : winnersData?.data?.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="space-y-2 pr-4">
              {winnersData.data.map((winner: any, index: number) => (
                <div
                  key={winner.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                  {/* Ranking */}
                  <div className="flex-shrink-0">
                    {index === 0 ? (
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          #{index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Winner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-white truncate">
                        {winner.characterName}
                      </span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {winner.username}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(winner.createdAt), 'dd MMM yyyy HH:mm', {
                        locale: th,
                      })}
                    </div>
                  </div>

                  {/* Jackpot Amount */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Trophy className="h-4 w-4" />
                      <span>
                        {winner.jackpotAmount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-300/60">Xeny</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>ยังไม่มีผู้โชคดีถูก Jackpot</p>
            <p className="text-xs mt-1">เป็นคนแรกสิ!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
