import React from 'react'

import Link from 'next/link'

type Action = {
  label: string
  href?: string
  onClick?: () => void
  icon: React.ReactNode
  variant?: 'primary' | 'danger'
}

interface AiCardProps {
  name: string
  description: string
  iconUrl: string
  visibility?: 'System' | 'Custom'
  link?: string // ถ้า click ทั้ง card ได้
  actions?: Action[]
  isDraft?: boolean // เพิ่ม prop สำหรับตรวจสอบว่าเป็นร่างหรือไม่
}

const AiCard = ({
  name,
  description,
  iconUrl,
  visibility,
  link,
  actions = [],
  isDraft = false, // กำหนดค่าเริ่มต้นเป็น false
}: AiCardProps) => {
  const Container: any = link ? Link : 'div'
  const containerProps = link ? { href: link } : {}

  const handleActionClick = (e: React.MouseEvent, action: Action) => {
    e.preventDefault() // ป้องกันการ navigate จาก Link
    e.stopPropagation() // หยุดการ propagate event

    if (action.onClick) {
      action.onClick()
    }
  }

  return (
    <Container
      tabIndex={0}
      className={`flex items-center gap-3 px-2 py-4 rounded-xl
         hover:bg-zinc-100 dark:hover:bg-zinc-800
         ${link ? 'cursor-pointer' : ''}`}
      {...containerProps}>
      {/* Icon */}
      <div className="h-[42px] w-[42px] shrink-0 relative">
        <div className="overflow-hidden rounded-full shadow-sm">
          <img
            src={iconUrl}
            alt={`${name} icon`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Badge สำหรับร่าง - แสดงที่มุมขวาล่างของ icon */}
        {/* {isDraft && (
          <div
            className="absolute -bottom-1 -right-1 size-4 rounded-full bg-amber-500 border border-white dark:border-zinc-800 flex items-center justify-center"
            title="ร่าง">
            <span className="sr-only">ร่าง</span>
          </div>
        )} */}
      </div>

      {/* Name & Description */}
      <div className="grow overflow-hidden px-4 pr-9 leading-tight md:w-3/5 md:grow-0">
        <div className="flex items-center gap-2">
          <h6 className="font-semibold mb-0.5">{name}</h6>

          {/* Badge "ร่าง" ข้างชื่อ */}
          {isDraft && (
            <span className="leading-normal ltr:ml-1 rtl:mr-1 badge badge-yellow">
              ร่าง
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm text-gray-500 truncate dark:text-dark-500">
          {description}
        </p>
      </div>

      {/* Visibility */}
      {visibility && (
        <div className="hidden md:flex items-center gap-1 px-2 text-token-text-tertiary text-sm">
          {visibility === 'System' ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="icon-sm shrink-0">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4C9.79086 4 8 5.79086 8 8H16C16 5.79086 14.2091 4 12 4ZM6 10C5.44772 10 5 10.4477 5 11V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V11C19 10.4477 18.5523 10 18 10H6ZM6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8C19.6569 8 21 9.34315 21 11V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V11C3 9.34315 4.34315 8 6 8ZM10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V17C13 17.5523 12.5523 18 12 18C11.4477 18 11 17.5523 11 17V15.7324C10.4022 15.3866 10 14.7403 10 14Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="icon-sm shrink-0">
              <path
                d="M12 2a2 2 0 0 0-2 2v2H7v12h10V6h-3V4a2 2 0 0 0-2-2zm0 2a1 1 0 0 1 1 1v2h-2V5a1 1 0 0 1 1-1zm-1.5 7a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-4z"
                fill="currentColor"
              />
            </svg>
          )}
          <span className="line-clamp-1">{visibility}</span>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex h-9 shrink-0 justify-end gap-2 font-semibold md:w-[100px]">
          {actions.map((act) =>
            act.href ? (
              <Link
                key={act.label}
                href={act.href}
                title={act.label}
                onClick={(e) => e.stopPropagation()}
                className={`rounded-lg px-3 py-2 transition-transform duration-100 ease-in hover:bg-white active:scale-[0.9] dark:bg-transparent dark:hover:bg-gray-700 ${
                  act.variant === 'danger'
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-token-text-primary'
                }`}>
                {act.icon}
              </Link>
            ) : (
              <button
                key={act.label}
                onClick={(e) => handleActionClick(e, act)}
                title={act.label}
                className={`rounded-lg px-3 py-2 transition-transform duration-100 ease-in hover:bg-white active:scale-[0.9] dark:bg-transparent dark:hover:bg-gray-700 ${
                  act.variant === 'danger'
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-token-text-primary'
                }`}>
                {act.icon}
              </button>
            )
          )}
        </div>
      )}
    </Container>
  )
}

export default AiCard
