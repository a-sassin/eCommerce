export const PERSONAL_DETAIL_LIST = {
    heading: 'Personal Details',
    list: [
        {
            label: 'First name',
            fieldName: 'firstName',
            placeholder: 'Enter your first name',
        },
        {
            label: 'Last name',
            fieldName: 'lastName',
            placeholder: 'Enter your last name',
        },
        {
            label: 'Email address',
            fieldName: 'emailAddress',
            placeholder: 'Enter your email address',
            type: 'email',
        },
    ],
};

export const SHIPPING_DETAIL_LIST = {
    heading: 'Shipping Details',
    list: [
        {
            label: 'Street address',
            fieldName: 'address',
            placeholder: 'Enter your street address',
        },
        {
            label: 'City',
            fieldName: 'city',
            placeholder: 'Enter your city name',
        },
        {
            label: 'State',
            fieldName: 'state',
            Optional: 'Optional',
            placeholder: 'Enter your state',
        },
        {
            label: 'Country',
            fieldName: 'country',
            placeholder: 'Enter your country name',
        },
        {
            label: 'Zip Code ',
            fieldName: 'zipCode',
            Optional: 'Optional',
            placeholder: 'Enter your zip code',
        },
    ],
};

export const PAYMENT_DETAIL_LIST = {
    heading: 'Payment Details',
    list: [
        {
            label: 'Payment Type',
            placeholder: 'Select your payment type',
            fieldName: 'paymentType',
            type: 'select',
        },
        {
            label: 'Credit Card Number',
            placeholder: 'Enter your credit card number',
            fieldName: 'cardNumber',
        },
        {
            label: 'Valid date',
            fieldName: 'validDate',
            type: 'month',
        },
        {
            label: 'Full Name (as shown on card)',
            placeholder: 'Enter your full name',
            fieldName: 'fullName',
        },
        {
            label: 'Security Code',
            placeholder: 'Enter your security code',
            fieldName: 'securityCode',
            type: 'password',
        },
    ],
};
