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

function getTravelCharge() {
    const postcode = document.getElementById('postcode').value.toUpperCase().trim();
    
    if (!postcode) {
        return 0;
    }

    // Check if postcode is in remote area
    for (let area of remoteAreas) {
        if (postcode.startsWith(area)) {
            return 20;
        }
    }

    return 0;
}

function getDiscount() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    // 10% discount for 5 or more properties
    if (quantity >= 5) {
        const basePrice = getBasePrice();
        const urgencySurcharge = getUrgencySurcharge();
        const travelCharge = getTravelCharge();
        const subtotal = (basePrice + urgencySurcharge + travelCharge) * quantity;
        return subtotal * 0.10;
    }

    return 0;
}

function updatePrice() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const basePrice = getBasePrice();
    const urgencySurcharge = getUrgencySurcharge();
    const travelCharge = getTravelCharge();
    const discount = getDiscount();

    // Update display values
    document.getElementById('basePrice').textContent = '£' + basePrice.toFixed(2);
    document.getElementById('urgencyCharge').textContent = '£' + urgencySurcharge.toFixed(2);
    document.getElementById('travelCharge').textContent = '£' + travelCharge.toFixed(2);
    document.getElementById('discount').textContent = '-£' + discount.toFixed(2);

    // Calculate unit cost (cost per property)
    const unitCost = basePrice + urgencySurcharge + travelCharge;
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
