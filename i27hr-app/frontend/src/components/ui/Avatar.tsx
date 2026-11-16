import { avatarTint, initials } from '@/lib/format'
import { cn } from '@/lib/cn'

const sizeClasses = {
  sm: 'h-[34px] w-[34px] text-[12px]',
  md: 'h-8 w-8 text-[12px]',
  lg: 'h-[52px] w-[52px] text-[15px]',
  xl: 'h-[88px] w-[88px] text-[26px]',
}

export function Avatar({
  id,
  name,
  size = 'sm',
  className,
}: {
  id: number
  name: string
  size?: keyof typeof sizeClasses
  className?: string
}) {
  const tint = avatarTint(id)
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full font-semibold', sizeClasses[size], className)}
      style={{ background: tint.bg, color: tint.text }}
    >
      {initials(name)}
    </span>
  )
}
