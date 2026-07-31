import { defineStore } from 'pinia';

interface Contact {
	name?: string;
	phone?: string;
	email?: string;
	company?: string;
	street1?: string;
	street2?: string;
	street3?: string;
	district?: string;
	city?: string;
	province?: string;
	postalCode?: string;
	countryCode?: string;
}

interface ShipperState {
	id?: string | number;
	type?: number;
	isDefault?: boolean;
	contact?: Contact;
}

interface ConsigneeState {
	Name: string;
	Phone: string;
	Email: string;
	Company: string;
	Street1: string;
	Street2: string;
	Street3: string;
	District: string;
	City: string;
	Province: string;
	PostalCode: string;
	CountryCode: string;
}

interface LineInfoState {
	GoodsInfo: {
		Sku: string;
		Name: string;
		HSCode: string;
		LocalName: string;
		Brand?: string;
		Model?: string;
	};
	LineTotal: { Value: string | number; Unit: number };
	Quantity: number;
	CmdyID: number;
}

interface ParcelState {
	Count: number;
	DecalaredWt: string | number;
	WeightUnit: number;
	DimUnit: number;
	DeclaredLen: string | number;
	DeclaredWidth: string | number;
	DeclaredHeight: string | number;
	PickingInfo: string;
	LineInfos: LineInfoState[];
}

const emptyCnee = (): ConsigneeState => ({
	Name: '',
	Phone: '',
	Email: '',
	Company: '',
	Street1: '',
	Street2: '',
	Street3: '',
	District: '',
	City: '',
	Province: '',
	PostalCode: '',
	CountryCode: '',
});

const emptyParcel = (): ParcelState => ({
	Count: 1,
	DecalaredWt: '',
	WeightUnit: 2,
	DimUnit: 1,
	DeclaredLen: '',
	DeclaredWidth: '',
	DeclaredHeight: '',
	PickingInfo: '',
	LineInfos: [
		{
			GoodsInfo: { Sku: '', Name: '', HSCode: '', LocalName: '' },
			LineTotal: { Value: '', Unit: 1 },
			Quantity: 1,
			CmdyID: 0,
		},
	],
});

export const useCreateParcelStore = defineStore('createparcel', {
	state: () => ({
		Cnee: emptyCnee() as ConsigneeState,
		Shipper: {} as ShipperState,
		Parcels: [emptyParcel()] as ParcelState[],
		ClientRefNbr: '',
		IsSign: 0 as 0 | 1,
	}),
	actions: {
		setShipper(s: ShipperState) {
			this.Shipper = JSON.parse(JSON.stringify(s));
		},
		setCnee(c: ConsigneeState) {
			this.Cnee = { ...c };
		},
		setParcels(p: ParcelState[]) {
			this.Parcels = JSON.parse(JSON.stringify(p));
		},
		setClientRefNbr(v: string) {
			this.ClientRefNbr = v;
		},
		setIsSign(v: 0 | 1) {
			this.IsSign = v;
		},
		reset() {
			this.Cnee = emptyCnee();
			this.Shipper = {};
			this.Parcels = [emptyParcel()];
			this.ClientRefNbr = '';
			this.IsSign = 0;
		},
		hydrate() {
			return {
				cnee: { ...this.Cnee },
				shipper: JSON.parse(JSON.stringify(this.Shipper)),
				parcels: JSON.parse(JSON.stringify(this.Parcels)),
				clientRefNbr: this.ClientRefNbr,
				isSign: this.IsSign,
			};
		},
	},
});
