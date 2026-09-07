import { css } from 'lit';

export const printStyles = css`
    @media print {
        :host {
            background: #fff !important;
            background-image: none !important;
            color: #000 !important;
            box-shadow: none !important;
            border: 1px solid #000 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
        }

        *,
        ::slotted(*) {
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            text-shadow: none !important;
            color: #000 !important;
        }

        footer,
        slot[name='footer'],
        slot[name='ctas'],
        .action-menu,
        #stock-checkbox,
        .checkbox-container,
        merch-gradient,
        ::slotted([slot='footer']),
        ::slotted([slot='ctas']),
        ::slotted(merch-addon),
        ::slotted(merch-quantity-select),
        ::slotted(merch-offer-select) {
            display: none !important;
        }
    }
`;
