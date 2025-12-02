// Demo authentication for development/testing
// Replace with real Supabase auth once credentials are set up

interface DemoUser {
  id: string
  email: string
  role: "admin" | "employee"
}

const demoUsers = [
  {
    id: "1",
    email: "qubes.connect@gmail.com",
    password: "Qubes@321",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "admin@qubes.com",
    password: "Admin@123",
    role: "admin" as const,
  },
  {
    id: "3",
    email: "employee@qubes.com",
    password: "Employee@123",
    role: "employee" as const,
  },
]

export async function demoSignIn(
  email: string,
  password: string
): Promise<{ user: DemoUser | null; error: string | null }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = demoUsers.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    return {
      user: null,
      error: "Invalid email or password",
    }
  }

  // Store session in both localStorage and cookie
  const session = {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        role: user.role,
      },
    },
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("demo_session", JSON.stringify(session))
    // Also set cookie for server-side access
    document.cookie = `demo_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${24 * 60 * 60}`
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    error: null,
  }
}

export async function demoSignOut(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_session")
    // Clear cookie
    document.cookie = "demo_session=; path=/; max-age=0"
  }
}

export function getDemoSession() {
  if (typeof window === "undefined") return null

  const session = localStorage.getItem("demo_session")
  if (!session) return null

  try {
    const parsed = JSON.parse(session)
    // Check if session expired
    if (parsed.expires_at && parsed.expires_at < Date.now()) {
      localStorage.removeItem("demo_session")
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function getDemoSessionFromCookie(cookieString: string | undefined) {
  if (!cookieString) return null

  try {
    const cookies = cookieString.split(";")
    const sessionCookie = cookies.find((c) => c.trim().startsWith("demo_session="))
    if (!sessionCookie) return null

    const sessionJson = decodeURIComponent(sessionCookie.split("=")[1])
    const session = JSON.parse(sessionJson)

    // Check if session expired
    if (session.expires_at && session.expires_at < Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}
