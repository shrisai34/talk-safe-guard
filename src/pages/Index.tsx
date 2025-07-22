import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceBot } from '@/components/VoiceBot';
import { UrlChecker } from '@/components/UrlChecker';
import { Shield, Mic, Link, Users, Target, BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PhishGuard</h1>
              <p className="text-sm text-muted-foreground">Cybersecurity Awareness Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Stay Safe from 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Phishing Attacks</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Use our AI-powered tools to learn about phishing threats and verify suspicious URLs. 
              Protect yourself and your organization with real-time security awareness.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="text-left shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-security)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mic className="h-5 w-5 text-primary" />
                  Voice Bot Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about phishing and get instant expert guidance through voice interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Voice-powered Q&A about phishing tactics</li>
                  <li>• Learn about email security best practices</li>
                  <li>• Get real-time responses with audio playback</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-left shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-security)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link className="h-5 w-5 text-primary" />
                  URL Safety Checker
                </CardTitle>
                <CardDescription>
                  Analyze suspicious URLs for phishing indicators and security threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Real-time URL threat analysis</li>
                  <li>• Detect suspicious domain patterns</li>
                  <li>• Risk scoring with detailed explanations</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">91%</h3>
              <p className="text-sm text-muted-foreground">of cyberattacks start with phishing</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">$4.9M</h3>
              <p className="text-sm text-muted-foreground">average cost of a data breach</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">70%</h3>
              <p className="text-sm text-muted-foreground">reduction in attacks with training</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tools Section */}
      <section className="py-12 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Bot
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL Checker
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="voice" className="space-y-6">
              <VoiceBot />
            </TabsContent>
            
            <TabsContent value="url" className="space-y-6">
              <UrlChecker />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 PhishGuard. Built for cybersecurity awareness and education.</p>
            <p className="mt-2">Always verify suspicious emails and URLs through official channels.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
