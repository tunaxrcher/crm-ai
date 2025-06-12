'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { Button } from '@src/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@src/components/ui/sheet'
import { useCharacter } from '@src/contexts/CharacterContext'
import { Crown, LogOut, Mail, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

export default function ProfileSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const { character } = useCharacter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative p-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ai-gradient-bg">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${character?.portrait})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center -108px',
                transform: 'scale(2.5)',
              }}
            />
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[90vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <Image
              src={character?.portrait || ''}
              alt=""
              width={240}
              height={240}
              className="object-cover"
            />

            {character && (
              <div className="text-center">
                <h3 className="font-semibold text-lg">{character.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Crown className="h-3 w-3" />
                  Level {character.level} - {character.title}
                </p>
              </div>
            )}
          </div>

          <hr className="border-t border-border" />

          {/* User Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">
                  {session?.user?.name || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm break-all">
                  {session?.user?.email || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-t border-border" />

          {/* Actions Section */}
          <div className="space-y-3">
            <Button
              className="w-full justify-start  bg-red-500"
              onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
