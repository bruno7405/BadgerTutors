import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { GraduationCap, User, Settings, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    toast.success("Logged out successfully");
  };

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnectWallet();
      toast.success("Wallet disconnected");
    } else {
      try {
        await connectWallet();
        toast.success("Wallet connected successfully");
      } catch (error) {
        toast.error("Failed to connect wallet");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <GraduationCap className="h-6 w-6" />
            BadgerTutors
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/search"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Search Tutors
              </Link>
              <Link
                to="/study-groups"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Study Groups
              </Link>
              <Link
                to="/sessions"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                My Sessions
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWalletAction}
                className="hidden sm:flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                {isConnected ? (
                  <span className="font-mono text-xs">
                    {walletAddress?.substring(0, 4)}...{walletAddress?.slice(-4)}
                  </span>
                ) : (
                  <span>Connect Wallet</span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user && getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWalletAction} className="sm:hidden">
                    <Wallet className="mr-2 h-4 w-4" />
                    {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
