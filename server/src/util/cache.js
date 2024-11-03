class Cache {
    constructor() {
      this.rateLimited = false;
    }
  
    isRateLimited() {
      return this.rateLimited;
    }
  
    setRateLimited() {
      this.rateLimited = true;
      // Set the rate limit expiration to 7 days (604800000 ms)
      setTimeout(() => {
        this.rateLimited = false;
      }, 604800000);
    }
  }
  
  export { Cache };
  