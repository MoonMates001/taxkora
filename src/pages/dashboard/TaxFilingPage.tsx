import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, FileCheck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const TaxFilingPage = () => {
  const { profile } = useAuth();
  const isBusinessAccount = profile?.account_type === "business";

  const filingSteps = [
    {
      step: 1,
      title: "Review Your Data",
      description: "Ensure all income and expenses are accurately recorded",
      status: "pending",
    },
    {
      step: 2,
      title: "Verify Tax Computation",
      description: "Check the computed tax amount and breakdown",
      status: "pending",
    },
    {
      step: 3,
      title: "Generate Tax Returns",
      description: "Create the official tax return documents",
      status: "pending",
    },
    {
      step: 4,
      title: "Submit to FIRS",
      description: "File your tax returns directly with the Federal Inland Revenue Service",
      status: "pending",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-accent" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Tax Filing</h1>
          <p className="text-muted-foreground mt-1">
            {isBusinessAccount
              ? "Submit your business tax returns to FIRS"
              : "File your personal income tax and get clearance"}
          </p>
        </div>
      </div>

      {/* Filing Status */}
      <Card className="shadow-card border-2 border-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-foreground">
                2025 Tax Year
              </h3>
              <p className="text-muted-foreground">
                Filing deadline: March 31, 2026
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Not Started
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filing Steps */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Filing Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filingSteps.map((step, index) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      step.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : step.status === "in-progress"
                        ? "bg-coral-400/10 text-accent"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.step}
                  </div>
                  {index < filingSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{step.title}</h4>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filing Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Ready to File?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              Complete your records first
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Before filing your taxes, ensure all your income and {isBusinessAccount ? "expense" : "expenditure"} records are complete and accurate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" size="lg">
                Review Records
              </Button>
              <Button size="lg" className="gap-2" disabled>
                <Send className="w-4 h-4" />
                Start Filing Process
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="shadow-card bg-coral-400/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                Need help with tax filing?
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our team of tax experts can assist you with the entire filing process. 
                We offer done-for-you tax filing services for both business and personal accounts.
              </p>
              <Button variant="accent">Contact Tax Expert</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxFilingPage;
