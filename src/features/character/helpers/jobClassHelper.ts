export class JobClassHelper {
  /**
   * หา job level ที่เหมาะสมตาม character level
   */
  static getJobLevelForCharacter(
    jobLevels: any[],
    characterLevel: number
  ): any {
    if (!jobLevels || jobLevels.length === 0) return null
    console.log('debug jobLevels :', jobLevels)
    console.log('debug characterLevel :', characterLevel)

    const sortedLevels = [...jobLevels].sort(
      (a, b) => a.requiredCharacterLevel - b.requiredCharacterLevel
    )

    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (characterLevel >= sortedLevels[i].requiredCharacterLevel) {
        return sortedLevels[i]
      }
    }

    return sortedLevels[0]
  }

  /**
   * ตรวจสอบว่าควรอัพเดท job level หรือไม่
   */
  // static shouldUpdateJobLevel(
  //   currentJobLevel: any,
  //   jobLevels: any[],
  //   newCharacterLevel: number
  // ): { shouldUpdate: boolean; newJobLevel: any | null } {

  //   const newJobLevel = this.getJobLevelForCharacter(
  //     jobLevels,
  //     newCharacterLevel
  //   )

  //   if (!newJobLevel || !currentJobLevel) return { shouldUpdate: !!newJobLevel, newJobLevel }

  //   const shouldUpdate = newJobLevel.level > currentJobLevel.level

  //   return {
  //     shouldUpdate,
  //     newJobLevel: shouldUpdate ? newJobLevel : null,
  //   }
  // }
  static shouldUpdateJobLevel(
    currentJobLevel: any,
    jobLevels: any[],
    newCharacterLevel: number
  ): { shouldUpdate: boolean; newJobLevel: any | null } {
    // หา job level ที่เหมาะสมสำหรับ character level ใหม่
    const newJobLevel = this.getJobLevelForCharacter(
      jobLevels,
      newCharacterLevel
    )

    if (!newJobLevel || !currentJobLevel)
      return { shouldUpdate: !!newJobLevel, newJobLevel }

    // เปลี่ยนลอจิกการเปรียบเทียบ: ใช้ ID แทนการเปรียบเทียบ level
    const shouldUpdate = newJobLevel.id !== currentJobLevel.id

    // เพิ่ม logging เพื่อการ debug
    console.log('Debug shouldUpdateJobLevel:', {
      currentJobLevelId: currentJobLevel.id,
      currentJobLevelTitle: currentJobLevel.title,
      currentJobLevelRequired: currentJobLevel.requiredCharacterLevel,
      newJobLevelId: newJobLevel.id,
      newJobLevelTitle: newJobLevel.title,
      newJobLevelRequired: newJobLevel.requiredCharacterLevel,
      characterLevel: newCharacterLevel,
      shouldUpdate,
    })

    return {
      shouldUpdate,
      newJobLevel: shouldUpdate ? newJobLevel : null,
    }
  }

  /**
   * คำนวณ XP ที่ต้องการสำหรับ level ถัดไป
   */
  static calculateNextLevelXP(
    currentLevel: number,
    baseXP: number = 1000
  ): number {
    return Math.floor(baseXP * Math.pow(1.2, currentLevel - 1))
  }
}
