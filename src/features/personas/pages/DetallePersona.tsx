import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { imagen } from '@/core/config/tmdb'
import { GrillaPeliculas } from '@/features/peliculas/components/GrillaPeliculas'
import { EsqueletoGrilla } from '@/shared/components/EsqueletoGrilla'
import { MensajeError } from '@/shared/components/MensajeError'
import { usePersona } from '../hooks/usePersona'

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function formatearFecha(fecha: string) {
  try {
    const [year, month, day] = fecha.split('-').map(Number)
    if (!year || !month || !day) return fecha
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

function EsqueletoPersona() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Cargando">
      <div className="flex flex-col gap-8 rounded-2xl border bg-card p-6 md:flex-row md:p-10">
        <Skeleton className="size-44 shrink-0 rounded-2xl md:size-56" />
        <div className="min-w-0 flex-1 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="mb-4 h-7 w-36" />
        <EsqueletoGrilla cantidad={10} />
      </div>
    </div>
  )
}

export function DetallePersona() {
  const { id } = useParams()
  const { datos: persona, error, cargando, reintentar } = usePersona(Number(id))

  if (error) {
    return (
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
          <Link to="/peliculas">
            <ArrowLeft /> Catálogo
          </Link>
        </Button>
        <MensajeError mensaje={error} onReintentar={reintentar} />
      </div>
    )
  }

  if (cargando || !persona) {
    return (
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
          <Link to="/peliculas">
            <ArrowLeft /> Catálogo
          </Link>
        </Button>
        <EsqueletoPersona />
      </div>
    )
  }

  // Si no hay fecha ni lugar, esa línea no aparece
  const partesNacimiento = [
    persona.birthday ? formatearFecha(persona.birthday) : null,
    persona.place_of_birth?.trim() ? persona.place_of_birth.trim() : null,
  ].filter(Boolean)
  const lineaNacimiento = partesNacimiento.join(' · ')

  // Dato derivado: ordenar por popularidad, quitar repetidas y cortar en 15
  const vistas = new Set<number>()
  const conocidoPor = (persona.movie_credits?.cast ?? [])
    .slice()
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .filter((peli) => {
      if (!peli.id || vistas.has(peli.id)) return false
      vistas.add(peli.id)
      return true
    })
    .slice(0, 15)

  return (
    <article>
      <title>{`${persona.name} · Cartelera`}</title>

      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground">
        <Link to="/peliculas">
          <ArrowLeft /> Catálogo
        </Link>
      </Button>

      <div className="rounded-2xl border bg-card p-6 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <Avatar className="size-44 shrink-0 rounded-2xl shadow-xl md:size-56">
            <AvatarImage
              src={imagen(persona.profile_path, 'h632') ?? imagen(persona.profile_path, 'w342') ?? undefined}
              alt={persona.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl text-4xl font-bold">
              {iniciales(persona.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{persona.name}</h1>

            {lineaNacimiento && (
              <p className="mt-2 text-sm text-muted-foreground">{lineaNacimiento}</p>
            )}

            <div className="mt-6">
              <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">Biografía</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground whitespace-pre-line">
                {persona.biography?.trim() ? persona.biography : 'Sin biografía en español'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {conocidoPor.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">Conocido por</h2>
          <GrillaPeliculas peliculas={conocidoPor} />
        </section>
      )}
    </article>
  )
}
