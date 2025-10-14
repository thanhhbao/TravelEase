import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  // ảnh dự phòng local (nên để trong public/)
  fallback?: string;
};

export default function SafeImage({ src, alt, className, fallback = "/placeholder-hotel.jpg" }: Props) {
  const [err, setErr] = useState(false);

  // tránh vòng lặp onError nếu fallback cũng lỗi
  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!err) {
      setErr(true);
      (e.target as HTMLImageElement).src = fallback;
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={onError}
      className={className}
      // thêm các tham số để Unsplash ổn định hơn
      // (nếu src đã có query thì giữ nguyên)
      referrerPolicy="no-referrer"
    />
  );
}
