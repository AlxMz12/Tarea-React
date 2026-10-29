export interface PeliculaCredito {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  popularity: number
}

export interface Persona {
  id: number
  name: string
  biography: string
  birthday: string | null
  place_of_birth: string | null
  profile_path: string | null
  movie_credits: {
    cast: PeliculaCredito[]
  }
}

