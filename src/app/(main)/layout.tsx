'use client'

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Suspense } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Sidebar side="right" collapsible="icon">
                <Suspense>
                    <MainNav />
                </Suspense>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
                    <UserNav />
                </header>
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
