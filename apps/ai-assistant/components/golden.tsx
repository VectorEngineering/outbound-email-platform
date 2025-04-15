'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel } from './ui/form';
import { handleGoldenTicket } from '@/actions/settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TicketIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Image from 'next/image';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

export const GoldenTicketModal = () => {
  const { refetch } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const form = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const hasDeclined = localStorage.getItem('goldenTicketDeclined');
    if (!hasDeclined) {
      setIsOpen(true);
    }
  }, []);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const { success, error } = await handleGoldenTicket(data.email);
    if (success) {
      toast.success('Golden ticket used, your friend will be notified');
      refetch();
      router.refresh();
      setIsOpen(false);
    } else {
      toast.error(error);
    }
  };

  const handleMaybeLater = () => {
    localStorage.setItem('goldenTicketDeclined', 'true');
    setIsOpen(false);
  };

  const email = form.watch('email');
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="">
          {state === 'collapsed' && !isMobile ? (
            <TicketIcon className="size-4" />
          ) : (
            <span className="mr-2">Invite a friend</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-4">
            <Image src="/white-icon.svg" alt="Zero" width={32} height={32} />
            <span>Welcome to Zero! 🎉 ✨</span>
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-3 pt-3">
            <span>
              Zero is still in early beta 🚀 and will continue to grow and improve from this point
              on. If you know a friend who wants to test and try out Zero, send them an invite! 💌
            </span>

            <span>You can only invite one person, so make it count! 🎯 ⭐️</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <Form {...form}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Input
                    placeholder="nizzy@gmail.com"
                    {...field}
                    className="placeholder:opacity-20"
                  />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-3">
              <Button onClick={handleMaybeLater} type="button" variant="outline" className="">
                Maybe Later
              </Button>
              <Button disabled={!email} type="submit" className="">
                <span className="mr-2">Send invite</span>
              </Button>
            </div>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  );
};
