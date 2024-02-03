import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils";

export default function SendForm({ className, balance }: { className?: string, balance: number } ) {

  const [recipient, setRecipient] = useState("0x5400f7672C096130efDc5AA15D470288A3931DB4");
  const [amount, setAmount] = useState("1.00");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("send form submitted");
    console.log("Recipient:", recipient);
    console.log("Amount:", amount);
  }

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="recipient">Recipient</Label>
        <Input id="recipient" defaultValue={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" min="0" max={balance || 1000000} defaultValue={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" type="number" defaultValue={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit">Send</Button>
    </form>
  )
}