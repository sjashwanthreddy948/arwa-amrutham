// Replace empty fields only with verified business information.
export const business = {
  name: 'ARWA Amrutham',
  category: 'Packaged Drinking Water',
  tagline: 'Pure Refreshment.',
  address: {
    street: '199, Lane No. 1, Krishna Reddy Nagar',
    locality: 'New Krishna Nagar, Kalluru',
    city: 'Kurnool',
    state: 'Andhra Pradesh',
    postalCode: '518002',
    country: 'India',
  },
  open24Hours: true,
  phone: '',
  whatsapp: '',
  email: '',
  googleMapsUrl: '',
  googleReviewsUrl: '',
  instagram: '',
  enquiryEndpoint: '',
}

export const addressText = Object.values(business.address).join(', ')
// A search based on the supplied address, rather than an unverified map pin.
export const mapSearchUrl =
  business.googleMapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${addressText}`)}`
export const directionsUrl =
  business.googleMapsUrl ||
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressText)}`
