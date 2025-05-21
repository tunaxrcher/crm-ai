"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Activity,
  ScrollText,
  Trophy,
  Gift,
} from "lucide-react";
import NotificationSheet from "@/components/shared/NotificationSheet";
import { ImageWithFallback } from "@/components/shared";
import { LevelUpNotification, AchievementUnlockedNotification } from "@/components/ui/notification-system";
import { useCharacter } from "@/features/character/context/CharacterContext";

// Client body wrapper without notification provider
export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return <ClientBodyInner>{children}</ClientBodyInner>;
}

// Inner component without notification context
function ClientBodyInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // State for special notification animations
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [achievement, setAchievement] = useState({
    name: "",
    description: "",
    icon: <Trophy className="h-10 w-10 text-amber-400" />,
    reward: ""
  });

  // Get character data
  const { character } = useCharacter();

  // Register animation effects
  useEffect(() => {
    if (!character) return;

    // Register event handlers for character level ups and achievements
    const handleLevelUp = () => {
      setCurrentLevel(character.level);
      setShowLevelUp(true);
    };

    const handleAchievementUnlocked = (achievement: any) => {
      setAchievement(achievement);
      setShowAchievement(true);
    };

    // Listen for level up events
    window.addEventListener('character:levelup', handleLevelUp);
    window.addEventListener('character:achievement', handleAchievementUnlocked);

    return () => {
      window.removeEventListener('character:levelup', handleLevelUp);
      window.removeEventListener('character:achievement', handleAchievementUnlocked);
    };
  }, [character]);

  // Skip footer on character creation page
  const isCharacterCreation = pathname === "/character/create";

  return (
    <div className="antialiased">
      {!isCharacterCreation && (
        <header className="fixed top-0 left-0 right-0 z-10 h-14 bg-card border-b border-border flex items-center justify-between px-4 max-w-md mx-auto">
          <Link href="/">
            <ImageWithFallback
              src="/auto-import-evx-logo.png"
              alt="Auto Import EVX Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center space-x-2">
            <NotificationSheet />

            <Link href="/profile/1">
              <div className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-sm font-medium">
                AR
              </div>
            </Link>
          </div>
        </header>
      )}

      <main className={`mobile-container ${!isCharacterCreation ? 'pt-16' : ''}`}>
        {children}
      </main>

      {!isCharacterCreation && (
        <footer className="mobile-footer">
          <Link
            href="/character"
            className={`footer-icon ${pathname === "/character" ? "ai-gradient-text" : "text-muted-foreground"}`}
          >
            <User className="h-6 w-6 mb-1" />
            <span>Character</span>
          </Link>

          <Link
            href="/feed"
            className={`footer-icon ${pathname === "/feed" ? "ai-gradient-text" : "text-muted-foreground"}`}
          >
            <Activity className="h-6 w-6 mb-1" />
            <span>Feed</span>
          </Link>

          <Link
            href="/quest"
            className={`footer-icon ${pathname === "/quest" ? "ai-gradient-text" : "text-muted-foreground"}`}
          >
            <ScrollText className="h-6 w-6 mb-1" />
            <span>Quest</span>
          </Link>

          <Link
            href="/ranking"
            className={`footer-icon ${pathname === "/ranking" ? "ai-gradient-text" : "text-muted-foreground"}`}
          >
            <Trophy className="h-6 w-6 mb-1" />
            <span>Ranking</span>
          </Link>

          <Link
            href="/reward"
            className={`footer-icon ${pathname === "/reward" ? "ai-gradient-text" : "text-muted-foreground"}`}
          >
            <Gift className="h-6 w-6 mb-1" />
            <span>Reward</span>
          </Link>
        </footer>
      )}

      {/* Special notification animations */}
      <LevelUpNotification
        level={currentLevel}
        isVisible={showLevelUp}
        onClose={() => setShowLevelUp(false)}
      />

      <AchievementUnlockedNotification
        achievement={achievement}
        isVisible={showAchievement}
        onClose={() => setShowAchievement(false)}
      />
    </div>
  );
}
