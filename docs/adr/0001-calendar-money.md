# ADR 0001: Money and billing date representation

Use ISO 4217 codes and signed integer minor units for money. Use calendar date strings for billing dates and date-only events. Store instants as UTC timestamps. This preserves a user's chosen payment day across daylight saving changes and avoids floating point inaccuracies.

