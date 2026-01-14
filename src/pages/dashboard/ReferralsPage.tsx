import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useReferrals } from "@/hooks/useReferrals";
import { 
  Gift, 
  Users, 
  Copy, 
  Send, 
  Check, 
  Clock, 
  Share2,
  Mail,
  Trophy,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ReferralsPage = () => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);
  
  const {
    userReferralCode,
    referrals,
    isLoading,
    sendInvite,
    completedReferrals,
    pendingReferrals,
    progress,
    hasEarnedReward,
    remainingToEarn,
    referralsRequired,
    getShareUrl,
  } = useReferrals();

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleCopyCode = async () => {
    if (!userReferralCode) return;
    
    try {
      await navigator.clipboard.writeText(userReferralCode);
      toast.success("Referral code copied!");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    await sendInvite.mutateAsync(inviteEmail);
    setInviteEmail("");
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    const shareData = {
      title: "Join TAXKORA",
      text: "I'm using TAXKORA for easy tax management. Sign up with my referral link and we both benefit!",
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "subscribed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "signed_up":
        return <Badge className="bg-blue-100 text-blue-800">Signed Up</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Referral Program
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite friends and earn a free year subscription!
          </p>
        </div>

        {/* Reward Progress Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {hasEarnedReward ? "🎉 Congratulations!" : "Earn 1 Year Free!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {hasEarnedReward 
                      ? "You've earned a free year subscription!" 
                      : `Refer ${referralsRequired} friends who subscribe to get 1 year free`}
                  </p>
                </div>
              </div>
              {hasEarnedReward && (
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  Reward Earned!
                </Badge>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {completedReferrals} / {referralsRequired} referrals
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              {!hasEarnedReward && (
                <p className="text-sm text-muted-foreground">
                  {remainingToEarn} more successful referral{remainingToEarn !== 1 ? "s" : ""} to go!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedReferrals}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{referrals?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Invites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Code & Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share your unique referral code or link with friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral Code */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Referral Code
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={userReferralCode || ""}
                    readOnly
                    className="font-mono text-lg font-semibold tracking-wider"
                  />
                  <Button variant="outline" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Referral Link
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={getShareUrl()}
                    readOnly
                    className="text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Referral Link
              </Button>
            </CardContent>
          </Card>

          {/* Email Invite */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Email Invite
              </CardTitle>
              <CardDescription>
                Invite friends directly via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Friend's Email
                  </label>
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendInvite.isPending || !inviteEmail.trim()}
                >
                  {sendInvite.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Invite
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm text-foreground mb-2">
                  How it works:
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Share your referral link or send an invite</li>
                  <li>Friend signs up using your link</li>
                  <li>Friend subscribes to any plan</li>
                  <li>You get credit toward your free year!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>
              Track the status of your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals && referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {referral.referred_email || "Pending signup"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Invited {format(new Date(referral.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {referral.completed_at && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(referral.completed_at), "MMM d")}
                        </span>
                      )}
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-1">No referrals yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start sharing your referral link to earn rewards!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default ReferralsPage;
