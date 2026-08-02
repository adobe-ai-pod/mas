import { LitElement, html } from 'lit';
import { PLACEHOLDER_REFERENCES_TIMEOUT_MS } from './mas-placeholders-repository.js';

class MasPlaceholderReferencesModal extends LitElement {
    static properties = {
        placeholderKey: { type: String },
        references: { type: Array },
        mode: { type: String },
        loading: { type: Boolean },
        elapsed: { type: Number },
        onClose: { type: Function, reflect: false },
        onProceed: { type: Function, reflect: false },
    };

    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.placeholderKey = '';
        this.references = [];
        this.mode = 'delete';
        this.loading = false;
        this.elapsed = 0;
        this.onClose = null;
        this.onProceed = null;
    }

    get showProceed() {
        if (this.loading) return false;
        if (this.references.length === 0) return true;
        return this.mode === 'publish' && this.elapsed < PLACEHOLDER_REFERENCES_TIMEOUT_MS;
    }

    get headline() {
        return this.mode === 'delete' ? 'Delete placeholder' : 'Publish placeholder';
    }

    renderBody() {
        if (this.loading) {
            return html`<sp-progress-circle indeterminate size="m"></sp-progress-circle>`;
        }
        if (this.references.length === 0) {
            return html`<p>No usage detected for placeholder <strong>${this.placeholderKey}</strong>.</p>`;
        }
        return html`
            <p>The following items use placeholder <strong>${this.placeholderKey}</strong>:</p>
            <ul>
                ${this.references.map(
                    (ref) => html`<li><span title="${ref.path || ''}">${ref.title || ref.path || ''}</span></li>`,
                )}
            </ul>
        `;
    }

    render() {
        if (this.showProceed) {
            return html`
                <sp-dialog-wrapper
                    type="modal"
                    headline="${this.headline}"
                    underlay
                    open
                    confirm-label="Proceed"
                    cancel-label="Cancel"
                    @close=${this.onClose}
                    @cancel=${this.onClose}
                    @confirm=${this.onProceed}
                >
                    <div class="dialog-content">${this.renderBody()}</div>
                </sp-dialog-wrapper>
            `;
        }
        return html`
            <sp-dialog-wrapper
                type="modal"
                headline="${this.headline}"
                underlay
                open
                cancel-label="Cancel"
                @close=${this.onClose}
                @cancel=${this.onClose}
            >
                <div class="dialog-content">${this.renderBody()}</div>
            </sp-dialog-wrapper>
        `;
    }
}

customElements.define('mas-placeholder-references-modal', MasPlaceholderReferencesModal);

/**
 * Appends a mas-placeholder-references-modal to document.body and returns a promise
 * that resolves to true (proceed) or false (cancel/close).
 * @param {{ mode: string, references: Array, elapsed: number, placeholderKey: string }} options
 * @returns {Promise<boolean>}
 */
export function showPlaceholderReferencesModal({ mode, references, elapsed, placeholderKey }) {
    return new Promise((resolve) => {
        const el = document.createElement('mas-placeholder-references-modal');
        el.mode = mode;
        el.references = references;
        el.elapsed = elapsed;
        el.placeholderKey = placeholderKey;
        el.loading = false;

        const cleanup = (result) => {
            el.remove();
            resolve(result);
        };

        el.onClose = () => cleanup(false);
        el.onProceed = () => cleanup(true);

        document.body.appendChild(el);
    });
}
