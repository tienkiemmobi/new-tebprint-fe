import { useEffect, useState } from "react";
import { CustomAxios } from '@/utils';

type AuthorizeShopifyProps = {
  code: string;
  shop: string;
};

const AuthorizeShopify = ({ code, shop }: AuthorizeShopifyProps) => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await CustomAxios.get(`http://localhost:3007/api/v1/shopify-access-token/auth/callback?code=${code}&&shop=${shop}`);
        setData(`Congratulations, you have successfully authorized ${shop}`);
      } catch (error: any) {
        setData(error.response.data.message);
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-[300px]">
      {data || "Loading..."}
    </div>
  );
};

export { AuthorizeShopify };