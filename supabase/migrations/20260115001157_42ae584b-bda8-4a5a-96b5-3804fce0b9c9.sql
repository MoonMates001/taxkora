-- Create webhook events table for logging
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  tx_ref TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_webhook_events_tx_ref ON public.webhook_events(tx_ref);
CREATE INDEX idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access webhook events (no public access)
CREATE POLICY "Service role only access"
ON public.webhook_events
FOR ALL
USING (false)
WITH CHECK (false);

-- Add comment
COMMENT ON TABLE public.webhook_events IS 'Logs all incoming Flutterwave webhook events for auditing and debugging';