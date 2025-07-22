import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldAlert, ShieldCheck, Link, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlCheckResult {
  status: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  reasons: string[];
}

export const UrlChecker = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<UrlCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const suspiciousKeywords = [
    'login', 'verify', 'update', 'urgent', 'suspend', 'confirm', 'security',
    'paypal', 'amazon', 'netflix', 'microsoft', 'google', 'facebook',
    'bank', 'secure', 'account', 'expired', 'limited', 'restricted'
  ];

  const checkUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to check.",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    setResult(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const analysis = analyzeUrl(url);
      setResult(analysis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze URL. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const analyzeUrl = (inputUrl: string): UrlCheckResult => {
    const reasons: string[] = [];
    let riskScore = 0;

    try {
      // Basic URL validation
      let urlToCheck = inputUrl;
      if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
        urlToCheck = 'https://' + urlToCheck;
      }

      const urlObj = new URL(urlToCheck);
      const domain = urlObj.hostname.toLowerCase();
      const path = urlObj.pathname.toLowerCase();
      const fullUrl = urlToCheck.toLowerCase();

      // Check for suspicious keywords in domain
      const domainSuspicious = suspiciousKeywords.some(keyword => 
        domain.includes(keyword) && !isLegitimateUse(domain, keyword)
      );
      
      if (domainSuspicious) {
        riskScore += 30;
        reasons.push("Domain contains suspicious keywords");
      }

      // Check for suspicious keywords in path
      const pathSuspicious = suspiciousKeywords.some(keyword => path.includes(keyword));
      if (pathSuspicious) {
        riskScore += 20;
        reasons.push("URL path contains phishing-related terms");
      }

      // Check for URL shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'short.link', 'tiny.cc'];
      if (shorteners.some(shortener => domain.includes(shortener))) {
        riskScore += 25;
        reasons.push("Uses URL shortening service");
      }

      // Check for suspicious domain patterns
      if (domain.includes('-') && domain.split('-').length > 3) {
        riskScore += 15;
        reasons.push("Domain has suspicious hyphen pattern");
      }

      // Check for misleading domains
      const commonBrands = ['paypal', 'amazon', 'microsoft', 'google', 'apple', 'netflix'];
      commonBrands.forEach(brand => {
        if (domain.includes(brand) && !domain.endsWith(`${brand}.com`) && !domain.endsWith(`${brand}.net`)) {
          riskScore += 40;
          reasons.push(`Potentially impersonating ${brand}`);
        }
      });

      // Check for IP addresses instead of domains
      if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
        riskScore += 35;
        reasons.push("Uses IP address instead of domain name");
      }

      // Check for excessive subdomains
      const subdomains = domain.split('.');
      if (subdomains.length > 4) {
        riskScore += 20;
        reasons.push("Excessive subdomains detected");
      }

      // Check for non-HTTPS
      if (urlToCheck.startsWith('http://')) {
        riskScore += 15;
        reasons.push("Not using secure HTTPS connection");
      }

      // Determine status based on risk score
      let status: 'safe' | 'suspicious' | 'dangerous';
      if (riskScore >= 50) {
        status = 'dangerous';
        reasons.unshift("High risk of phishing");
      } else if (riskScore >= 25) {
        status = 'suspicious';
        reasons.unshift("Potential security concerns");
      } else {
        status = 'safe';
        if (reasons.length === 0) {
          reasons.push("No obvious red flags detected");
        }
      }

      return {
        status,
        score: Math.min(riskScore, 100),
        reasons
      };

    } catch (error) {
      return {
        status: 'suspicious',
        score: 30,
        reasons: ["Invalid URL format", "Could not properly analyze URL"]
      };
    }
  };

  const isLegitimateUse = (domain: string, keyword: string): boolean => {
    // List of legitimate domains that might contain suspicious keywords
    const legitimateDomains = [
      'login.microsoftonline.com',
      'accounts.google.com',
      'secure.paypal.com',
      'login.live.com'
    ];
    
    return legitimateDomains.some(legit => domain.includes(legit));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <ShieldCheck className="h-6 w-6 text-success" />;
      case 'suspicious':
        return <ShieldAlert className="h-6 w-6 text-warning" />;
      case 'dangerous':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return <Shield className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'border-success bg-success/5';
      case 'suspicious':
        return 'border-warning bg-warning/5';
      case 'dangerous':
        return 'border-destructive bg-destructive/5';
      default:
        return 'border-border';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-6 w-6 text-primary" />
          URL Phishing Checker
        </CardTitle>
        <CardDescription>
          Enter a URL to check for potential phishing indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter URL to check (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkUrl()}
            className="flex-1"
          />
          <Button 
            onClick={checkUrl} 
            disabled={isChecking}
            className="px-6"
          >
            {isChecking ? 'Checking...' : 'Check'}
          </Button>
        </div>

        {isChecking && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="animate-pulse">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Analyzing URL security...</p>
            </div>
          </div>
        )}

        {result && !isChecking && (
          <div className={`p-6 rounded-lg border-2 ${getStatusColor(result.status)}`}>
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(result.status)}
              <div>
                <h3 className="font-semibold text-lg capitalize">
                  {result.status === 'dangerous' ? 'Dangerous' : 
                   result.status === 'suspicious' ? 'Suspicious' : 'Safe'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Risk Score: {result.score}/100
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Analysis Details:</h4>
              <ul className="space-y-1">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.status !== 'safe' && (
              <div className="mt-4 p-3 bg-background/50 rounded border">
                <p className="text-sm font-medium mb-1">⚠️ Security Recommendation:</p>
                <p className="text-sm text-muted-foreground">
                  {result.status === 'dangerous' 
                    ? "Do not visit this URL. It shows high-risk phishing indicators."
                    : "Exercise caution. Verify the URL's legitimacy before entering any personal information."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>This tool checks for:</strong></p>
          <p>• Suspicious keywords and domain patterns</p>
          <p>• URL shorteners and redirects</p>
          <p>• Brand impersonation attempts</p>
          <p>• Non-secure connections (HTTP)</p>
        </div>
      </CardContent>
    </Card>
  );
};