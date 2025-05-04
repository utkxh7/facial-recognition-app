function FaceBox({ face }: { face: any }) {
    // Add this guard at component start
    if (!face?.detection?.box) return null;
  
    // Rest of your rendering logic...
  }