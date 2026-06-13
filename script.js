// Base prices for different bedroom counts
const basePrices = {
    1: 95,
    2: 110,
    3: 125,
    4: 140,
    5: 160,
    6: 180
};

// Remote area postcode prefixes (higher surcharges)
const remoteAreas = ['PH', 'IV', 'HS', 'KA27', 'KA28', 'PA', 'TR', 'EX', 'PL', 'TQ'];

// Base postcode for distance calculation
const basePostcode = 'DL1 2AB';

// Haversine formula to calculate distance between two coordinates (in miles)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get coordinates for a UK postcode using postcodes.io API
async function getPostcodeCoordinates(postcode) {
    try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
        if (response.ok) {
            const data = await response.json();
            return {
                latitude: data.result.latitude,
                longitude: data.result.longitude
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching postcode coordinates:', error);
        return null;
    }
}

function getBasePrice() {
    const bedrooms = document.getElementById('bedrooms').value;
    return basePrices[bedrooms];
}

function getUrgencySurcharge() {
    const urgency = document.getElementById('urgency').value;
    const basePrice = getBasePrice();

    switch (urgency) {
        case 'express':
            return basePrice * 0.30; // 30% surcharge
        case 'urgent':
            return basePrice * 0.60; // 60% surcharge
        default:
            return 0;
    }
}

async function getTravelCharge() {
    const postcode = document.getElementById('postcode').value.toUpperCase().trim();
    
    if (!postcode) {
        return 0;
    }

    try {
        // Get coordinates for both postcodes
        const [baseCoords, targetCoords] = await Promise.all([
            getPostcodeCoordinates(basePostcode),
            getPostcodeCoordinates(postcode)
        ]);

        if (baseCoords && targetCoords) {
            // Calculate distance in miles
            const distance = haversineDistance(
                baseCoords.latitude,
                baseCoords.longitude,
                targetCoords.latitude,
                targetCoords.longitude
            );
            // £1 per mile
            return Math.round(distance);
        }
    } catch (error) {
        console.error('Error calculating travel charge:', error);
    }

    // Fallback: Check if postcode is in remote area (for backwards compatibility)
    for (let area of remoteAreas) {
        if (postcode.startsWith(area)) {
            return 20;
        }
    }

    return 0;
}

function getConservatorySurcharge() {
    const hasConservatory = document.getElementById('conservatory').checked;
    return hasConservatory ? 20 : 0;
}

async function getDiscount() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    // 10% discount for 5 or more properties
    if (quantity >= 5) {
        const basePrice = getBasePrice();
        const urgencySurcharge = getUrgencySurcharge();
        const travelCharge = await getTravelCharge();
        const conservatorySurcharge = getConservatorySurcharge();
        const subtotal = (basePrice + urgencySurcharge + travelCharge + conservatorySurcharge) * quantity;
        return subtotal * 0.10;
    }

    return 0;
}

async function updatePrice() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const basePrice = getBasePrice();
    const urgencySurcharge = getUrgencySurcharge();
    const travelCharge = await getTravelCharge();
    const conservatorySurcharge = getConservatorySurcharge();
    const discount = await getDiscount();

    // Update display values
    document.getElementById('basePrice').textContent = '£' + basePrice.toFixed(2);
    document.getElementById('urgencyCharge').textContent = '£' + urgencySurcharge.toFixed(2);
    document.getElementById('travelCharge').textContent = '£' + travelCharge.toFixed(2);
    document.getElementById('conservatorySurcharge').textContent = '£' + conservatorySurcharge.toFixed(2);
    document.getElementById('discount').textContent = '-£' + discount.toFixed(2);

    // Calculate unit cost (cost per property)
    const unitCost = basePrice + urgencySurcharge + travelCharge + conservatorySurcharge;
    document.getElementById('unitCost').textContent = '£' + unitCost.toFixed(2);

    // Calculate total cost
    const totalBeforeDiscount = unitCost * quantity;
    const totalCost = totalBeforeDiscount - discount;
    document.getElementById('totalCost').textContent = '£' + totalCost.toFixed(2);
}

function resetCalculator() {
    document.getElementById('bedrooms').value = '1';
    document.getElementById('postcode').value = '';
    document.getElementById('urgency').value = 'standard';
    document.getElementById('quantity').value = '1';
    document.getElementById('conservatory').checked = false;
    updatePrice();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePrice();
});

// Ensure initialization runs even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // DOM is still loading
    document.addEventListener('DOMContentLoaded', updatePrice);
} else {
    // DOM is already loaded
    updatePrice();
}
