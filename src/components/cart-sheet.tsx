import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Separator } from "#/components/ui/separator";
import { ScrollArea } from "#/components/ui/scroll-area";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "#/components/ui/sheet";

const cartItemCount = 0; // TODO: wire up to real cart state

export function CartSheet() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-none">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-none px-1 text-[10px]">
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Open cart</span>
          </Button>
        }
      />
      <SheetContent className="flex w-full flex-col rounded-none sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            {cartItemCount === 0
              ? "Your cart is empty"
              : `${cartItemCount} item${cartItemCount > 1 ? "s" : ""} in your cart`}
          </SheetDescription>
        </SheetHeader>
        <Separator />

        {cartItemCount === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>Add items to see them here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                className="rounded-none"
                render={<Link to="/shop">Start shopping</Link>}
                nativeButton={false}
              />
            </EmptyContent>
          </Empty>
        ) : (
          <ScrollArea className="flex-1 px-4">
            {/* cart items go here */}
          </ScrollArea>
        )}

        <div className="mt-auto space-y-3 border-t p-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Subtotal</span>
            <span>Rs. 0</span>
          </div>
          <Button
            className="w-full rounded-none"
            disabled={cartItemCount === 0}
          >
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
