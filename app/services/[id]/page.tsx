import { prisma } from "../../lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import ClientAddToCart from "./ClientAddToCart";

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: serviceId } = await params;
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!service) {
    notFound();
  }

  // Use a fallback image if no image is present
  const imageUrl = service.imageUrl || "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?auto=format&fit=crop&q=80&w=800";

  return (
    <main className="min-h-screen bg-[var(--color-creamy-white)] pt-[100px] px-[29px] pb-[100px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-[50px] md:gap-[80px]">
          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[3/4] md:aspect-square w-full rounded-[10px] overflow-hidden bg-[var(--color-stone)]">
              <Image 
                src={imageUrl}
                alt={service.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Details Section */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {service.category && (
              <span className="text-[12px] uppercase tracking-[0.2em] font-medium text-[var(--color-olive-green)] mb-[17px]">
                {service.category}
              </span>
            )}
            <h1 className="font-[family-name:var(--font-cardinal-fruit)] text-[50px] md:text-[70px] leading-[0.95] text-[var(--color-warm-black)] italic mb-[25px]">
              {service.name}
            </h1>
            
            <div className="flex items-center gap-[25px] mb-[33px] pb-[33px] border-b border-[var(--color-stone)] text-[15px] font-medium opacity-80">
              <span>{service.duration}</span>
              <span className="w-[4px] h-[4px] rounded-full bg-current opacity-50" />
              <span>{service.price}</span>
            </div>

            {service.description ? (
              <p className="text-[16px] leading-[1.6] opacity-80 mb-[30px]">
                {service.description}
              </p>
            ) : (
              <p className="text-[16px] leading-[1.6] opacity-80 mb-[30px]">
                Experience luxury and care with our signature {service.name} treatment.
              </p>
            )}

            {service.waxArea && (
              <div className="mb-[50px] p-[20px] bg-[var(--color-stone)]/30 rounded-[10px] border border-[var(--color-stone)]">
                <h3 className="text-[13px] uppercase tracking-[0.2em] font-medium mb-[8px] text-[var(--color-olive-green)]">Treatment Area</h3>
                <p className="text-[15px] opacity-80">{service.waxArea}</p>
              </div>
            )}

            {/* Client Component for adding to Zustand cart */}
            <ClientAddToCart service={{
              id: service.id,
              name: service.name,
              price: service.price,
              duration: service.duration,
              imageUrl: service.imageUrl,
              category: service.category
            }} />
          </div>
        </div>
      </div>
    </main>
  );
}
