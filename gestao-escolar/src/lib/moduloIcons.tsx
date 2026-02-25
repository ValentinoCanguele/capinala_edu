/**
 * Mapa de nomes de ícone (catálogo/API) para componentes Lucide.
 * Permite que módulos definam ícone por string e o core renderize.
 */
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Clock,
  Megaphone,
  BookMarked,
  Calendar,
  DoorOpen,
  Banknote,
  History,
  Settings,
  Download,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Clock,
  Megaphone,
  BookMarked,
  Calendar,
  DoorOpen,
  Banknote,
  History,
  Settings,
}

export function getModuleIcon(icone: string | null | undefined): LucideIcon {
  if (icone && ICON_MAP[icone]) return ICON_MAP[icone]
  return BookOpen
}

export { Download, SlidersHorizontal }
