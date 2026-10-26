import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
export default function CrudsHeader({ title, description }) {
    return (
        <header className="border-b border-border/40 px-4 py-4 sticky top-0 bg-background/80 backdrop-blur-lg z-10">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" aria-label="Back to home">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </header>

    )
}