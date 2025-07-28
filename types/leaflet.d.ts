declare global {
  interface Window {
    L: any;
    showDirections: (propertyId: string) => void;
    selectProperty: (propertyId: string) => void;
    removePin: (pinId: number) => void;
  }
}

export {}; 