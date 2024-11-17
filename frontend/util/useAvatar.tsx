import { useEffect, useState } from "react";

// import { icons } from "../images";
import { getNounAvatar } from "./nounAvatar";
import { useWallets } from "@privy-io/react-auth";

export const useAvatarNounsURL = (email: string) => {
    const [profileURL, setProfileURL] = useState<string>(
        "",
    );

    const { wallets } = useWallets()
	const embeddedWallet = wallets.find(
		(wallet) => wallet.walletClientType === 'privy'
	)
    // const { getAddress } = useMagic();

    useEffect(() => {
        getAvatarForProfile();
    }, [email]);

    const getAvatarForProfile = async () => {
        const  address  =embeddedWallet?.address ?? "default";

        const url = getNounAvatar(address);

        setProfileURL(url);
        // return url;
    };

    return {
        profileURL,
    };
};