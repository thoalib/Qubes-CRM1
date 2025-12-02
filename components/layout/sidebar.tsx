"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CheckSquare, GraduationCap, DollarSign, UserCog, Database, ListTodo, BarChart3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-sky-500",
        roles: ["admin", "employee"],
    },
    {
        label: "My Leads",
        icon: ListTodo,
        href: "/my-leads",
        color: "text-purple-500",
        roles: ["employee"], // Only for employees
    },
    {
        label: "Customers",
        icon: Database,
        href: "/customers",
        color: "text-indigo-500",
        roles: ["admin", "employee"],
    },
    {
        label: "Leads",
        icon: Users,
        href: "/leads",
        color: "text-violet-500",
        roles: ["admin"], // Only for admins
    },
    {
        label: "Tasks",
        icon: CheckSquare,
        href: "/tasks",
        color: "text-pink-700",
        roles: ["admin", "employee"],
    },
    {
        label: "Students",
        icon: GraduationCap,
        href: "/students",
        color: "text-orange-700",
        roles: ["admin", "employee"],
    },
    {
        label: "Finance",
        icon: DollarSign,
        href: "/finance",
        color: "text-emerald-500",
        roles: ["admin"], // Only for admins
    },
    {
        label: "Team",
        icon: BarChart3,
        href: "/team",
        color: "text-cyan-500",
        roles: ["admin"], // Only for admins/managers
    },
    {
        label: "Employees",
        icon: UserCog,
        href: "/employees",
        color: "text-blue-500",
        roles: ["admin"], // Only for admins
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const { role, loading } = useAuth()

    // Show loading state
    if (loading) {
        return (
            <div className="space-y-4 py-4 flex flex-col h-full bg-gray-50 text-gray-900 border-r">
                <div className="px-3 py-2 flex-1">
                    <div className="flex items-center pl-3 mb-14">
                        <h1 className="text-2xl font-bold">
                            Qubes<span className="font-light">CRM</span>
                        </h1>
                    </div>
                    <div className="text-center text-muted-foreground">Loading...</div>
                </div>
            </div>
        )
    }

    // Filter routes based on user role
    const visibleRoutes = routes.filter(route =>
        role && route.roles.includes(role)
    )

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-gray-50 text-gray-900 border-r">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Qubes<span className="font-light">CRM</span>
                    </h1>
                </Link>
                <div className="space-y-1">
                    {visibleRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-200 rounded-lg transition",
                                pathname === route.href ? "bg-gray-200" : "transparent"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <div className="text-xs text-gray-500 px-3">
                    Role: <span className="font-semibold capitalize">{role || 'Loading...'}</span>
                </div>
            </div>
        </div>
    )
}
