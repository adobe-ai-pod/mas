import { LitElement, html, nothing } from 'lit';

class MasPlaceholderReferencesModal extends LitElement {
    static properties = {
        placeholderKey: { type: String, attribute: 'placeholder-key' },
        surface: { type: String },
        locale: { type: String },
        onProceed: { type: Function, attribute: false },
        onCancel: { type: Function, attribute: false },
        _loading: { type: Boolean, state: true },
        _items: { type: Array, state: true },
        _timedOut: { type: Boolean, state: true },
    };

    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.placeholderKey = null;
        this.surface = null;
        this.locale = null;
        this.onProceed = null;
        this.onCancel = null;
        this._loading = true;
        this._items = [];
        this._timedOut = false;
    }

    get repository() {
        return document.querySelector('mas-repository');
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.#loadReferences();
    }

    async #loadReferences() {
        if (!this.placeholderKey) {
            this._loading = false;
            return;
        }
        this._loading = true;
        try {
            const result = await this.repository.findPlaceholderReferences(
                this.placeholderKey,
                this.surface,
                this.locale,
            );
            this._items = result.items;
            this._timedOut = result.timedOut;
        } catch {
            this._items = [];
            this._timedOut = true;
        } finally {
            this._loading = false;
        }
    }

    get #canProceed() {
        return !this._loading && !this._timedOut;
    }

    #handleProceed() {
        if (this.onProceed) this.onProceed();
    }

    #handleCancel() {
        if (this.onCancel) this.onCancel();
    }

    render() {
        return html`
            <div class="placeholder-references-overlay"
                style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4);
                       display: flex; align-items: center; justify-content: center; z-index: 1600;">
                <div style="background: var(--spectrum-white, #fff); border-radius: 12px; padding: 24px;
                            min-width: 380px; max-width: 560px; max-height: 80vh; overflow-y: auto;
                            box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                    <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700;">
                        Placeholder References
                    </h3>
                    <p style="margin: 0 0 16px; font-size: 13px; color: var(--spectrum-gray-700);">
                        Searching for fragments that use
                        <strong>"${this.placeholderKey}"</strong>&hellip;
                    </p>

                    ${this._loading
                        ? html`<sp-progress-circle indeterminate size="m" style="display: block; margin: 16px auto;"></sp-progress-circle>`
                        : this.#renderResults()}

                    <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
                        <sp-button variant="secondary" @click=${this.#handleCancel}>Cancel</sp-button>
                        ${this.#canProceed
                            ? html`<sp-button variant="primary" @click=${this.#handleProceed}>Proceed</sp-button>`
                            : nothing}
                    </div>
                </div>
            </div>
        `;
    }

    #renderResults() {
        if (this._timedOut) {
            return html`
                <div style="color: var(--spectrum-negative-color-700, #c9222c); font-size: 13px; margin-bottom: 8px;">
                    Reference check timed out (15 s). Review the results below before proceeding manually.
                </div>
                ${this.#renderItemList()}
            `;
        }

        if (this._items.length === 0) {
            return html`
                <div style="color: var(--spectrum-gray-700); font-size: 13px;">
                    No usage detected — it is safe to proceed.
                </div>
            `;
        }

        return html`
            <div style="font-size: 13px; color: var(--spectrum-gray-700); margin-bottom: 8px;">
                Found in <strong>${this._items.length}</strong> fragment(s):
            </div>
            ${this.#renderItemList()}
        `;
    }

    #renderItemList() {
        if (!this._items.length) return nothing;
        return html`
            <ul style="margin: 0; padding-left: 16px; font-size: 13px;">
                ${this._items.map(
                    (item) => html`
                        <li style="margin-bottom: 6px;">
                            <a href="${item.path}" target="_blank" rel="noopener">${item.title || item.path}</a>
                        </li>
                    `,
                )}
            </ul>
        `;
    }
}

customElements.define('mas-placeholder-references-modal', MasPlaceholderReferencesModal);

/**
 * Open the placeholder references modal and return a promise resolving to true (proceed) or false (cancel).
 * @param {{ placeholderKey: string, surface: string, locale: string }} options
 * @returns {Promise<boolean>}
 */
export function showPlaceholderReferencesModal({ placeholderKey, surface, locale }) {
    return new Promise((resolve) => {
        const modal = document.createElement('mas-placeholder-references-modal');
        modal.placeholderKey = placeholderKey;
        modal.surface = surface;
        modal.locale = locale;
        modal.onProceed = () => {
            modal.remove();
            resolve(true);
        };
        modal.onCancel = () => {
            modal.remove();
            resolve(false);
        };
        document.body.appendChild(modal);
    });
}
