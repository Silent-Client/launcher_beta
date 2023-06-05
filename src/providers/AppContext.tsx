import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useState,
} from "react";
import User from "../types/User";

export type AppContextType = {
	props: PropsType;
	setProps?: Dispatch<SetStateAction<PropsType>>;
};

export type PropsType = {
	accounts: User[];
	selected_account: number | null;
};

const AppContext = createContext<AppContextType>({
	props: {
		accounts: [],
		selected_account: null,
	},
});

export default function AppProvider({ children }: { children: ReactNode }) {
	const [props, setProps] = useState<PropsType>({
		accounts: [],
		selected_account: null,
	});

	return (
		<AppContext.Provider value={{ props, setProps }}>
			{children}
		</AppContext.Provider>
	);
}

export { AppContext };
