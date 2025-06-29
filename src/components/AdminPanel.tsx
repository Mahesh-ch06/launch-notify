
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { NotificationService, NotificationData } from './NotificationService';
import { Send, Users, Bell, Rocket, BarChart3 } from "lucide-react";

const AdminPanel = () => {
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState<NotificationData[]>([]);
  const [stats, setStats] = useState({ totalSubscribers: 0, totalNotifications: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subscribersData, statsData] = await Promise.all([
        NotificationService.getSubscribers(),
        NotificationService.getStats()
      ]);
      setSubscribers(subscribersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSendUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateTitle || !updateContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content for the update.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const recipients = subscribers.map(sub => sub.email);
      
      await NotificationService.sendUpdate({
        title: updateTitle,
        content: updateContent,
        recipients
      });

      toast({
        title: "Update Sent! 📧",
        description: `Update "${updateTitle}" has been sent to ${recipients.length} subscribers.`,
      });

      setUpdateTitle("");
      setUpdateContent("");
      
      // Reload stats
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendLaunchNotification = async () => {
    setIsLoading(true);

    try {
      await NotificationService.sendLaunchNotification();
      
      toast({
        title: "Launch Notification Sent! 🚀",
        description: "All subscribers have been notified about the CampusConnect launch!",
      });
      
      // Reload stats
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send launch notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">CampusConnect Admin Panel</h1>
          <p className="text-gray-300">Manage notifications and updates for your subscribers</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalSubscribers}</p>
                    <p className="text-sm text-gray-300">Active Subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-8 w-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalNotifications}</p>
                    <p className="text-sm text-gray-300">Notifications Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="send-update" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="send-update" className="data-[state=active]:bg-emerald-500">
              <Send className="h-4 w-4 mr-2" />
              Send Update
            </TabsTrigger>
            <TabsTrigger value="launch" className="data-[state=active]:bg-emerald-500">
              <Rocket className="h-4 w-4 mr-2" />
              Launch
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="data-[state=active]:bg-emerald-500">
              <Users className="h-4 w-4 mr-2" />
              Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send-update">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Send Update to Subscribers
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Send a custom update notification to all {stats.totalSubscribers} active subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendUpdate} className="space-y-6">
                  <div>
                    <Label htmlFor="updateTitle" className="text-white">
                      Update Title
                    </Label>
                    <Input
                      id="updateTitle"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      placeholder="e.g., New Features Available!"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="updateContent" className="text-white">
                      Update Content
                    </Label>
                    <Textarea
                      id="updateContent"
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      placeholder="Write your update message here..."
                      rows={6}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || stats.totalSubscribers === 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : `Send Update to ${stats.totalSubscribers} Subscribers`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="launch">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Launch Notification
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Send the official launch notification to all {stats.totalSubscribers} subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-white">
                    This will send a special launch notification email to all active subscribers, 
                    letting them know that CampusConnect is now live and available!
                  </p>
                  
                  <Button
                    onClick={handleSendLaunchNotification}
                    disabled={isLoading || stats.totalSubscribers === 0}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : `Send Launch Notification to ${stats.totalSubscribers} Subscribers`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subscriber Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage your {stats.totalSubscribers} notification subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={loadData} className="bg-emerald-500 hover:bg-emerald-600">
                    <Users className="h-4 w-4 mr-2" />
                    Refresh Subscribers
                  </Button>

                  {subscribers.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold">
                        Active Subscribers ({subscribers.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {subscribers.map((subscriber, index) => (
                          <div
                            key={index}
                            className="bg-white/5 p-3 rounded-lg border border-white/10"
                          >
                            <p className="text-white font-medium">{subscriber.firstName}</p>
                            <p className="text-gray-300 text-sm">{subscriber.email}</p>
                            <p className="text-gray-400 text-xs">
                              Subscribed: {new Date(subscriber.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-300">No subscribers yet</p>
                      <p className="text-gray-400 text-sm">Subscribers will appear here when they sign up</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
