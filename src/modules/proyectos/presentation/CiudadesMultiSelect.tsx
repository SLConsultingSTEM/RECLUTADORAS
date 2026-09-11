import { IconMapPin } from '@shared/ui/icons'
import {
  OpcionesMultiSelect,
  type OpcionesMultiSelectProps,
} from '@modules/proyectos/presentation/OpcionesMultiSelect'

export const CATALOGO_CIUDADES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
  'Manizales',
  'Santa Marta',
  'Ibagué',
] as const

type CiudadesMultiSelectProps = Omit<
  OpcionesMultiSelectProps,
  'catalog' | 'placeholder' | 'addPlaceholder' | 'icon' | 'requireOne'
>

export function CiudadesMultiSelect({
  label = 'Ciudades',
  ...rest
}: CiudadesMultiSelectProps) {
  return (
    <OpcionesMultiSelect
      label={label}
      catalog={[...CATALOGO_CIUDADES]}
      placeholder="Selecciona ciudades"
      addPlaceholder="Agregar ciudad…"
      icon={<IconMapPin size={16} />}
      {...rest}
    />
  )
}
