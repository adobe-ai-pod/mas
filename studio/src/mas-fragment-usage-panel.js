import { LitElement, html, nothing } from 'lit';
import Store from './store.js';
import ReactiveController from './reactivity/reactive-controller.js';

class MasFragmentUsagePanel extends LitElement {
    static properties = {
        fragmentId: { type: String, attribute: 'fragment-id' },
    };

    createRenderRoot() {
        return this;
    }

    constructor() {
        super();
        this.fragmentId = null;
        this.reactiveController = new ReactiveController(this, [Store.fragments.usages]);
    }

    get usageEntry() {
        if (!this.fragmentId) return null;
        return Store.fragments.usages.get()[this.fragmentId] ?? null;
    }

    render() {
        const entry = this.usageEntry;
        if (!entry) return nothing;

        return html`
            <div class="fragment-usage-panel" style="margin-top: 16px; padding: 12px; border: 1px solid var(--spectrum-gray-300); border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 8px;">Fragment Usage</div>
                ${entry.loading
                    ? html`<sp-progress-circle indeterminate size="s"></sp-progress-circle>`
                    : this.renderReferenceList(entry.references)}
            </div>
        `;
    }

    renderReferenceList(references) {
        if (!references || references.length === 0) {
            return html`<div style="color: var(--spectrum-gray-600); font-size: 13px;">No references found</div>`;
        }

        return html`
            <div style="font-size: 13px; color: var(--spectrum-gray-700); margin-bottom: 6px;">
                Used in ${references.length} collection(s)
            </div>
            <ul style="margin: 0; padding-left: 16px; font-size: 13px;">
                ${references.map(
                    (ref) => html`
                        <li style="margin-bottom: 4px;">
                            <a href="${ref.path}" target="_blank" rel="noopener">${ref.title || ref.path}</a>
                            ${ref.status ? html`<span style="margin-left: 6px; color: var(--spectrum-gray-500);">(${ref.status})</span>` : nothing}
                        </li>
                    `,
                )}
            </ul>
        `;
    }
}

customElements.define('mas-fragment-usage-panel', MasFragmentUsagePanel);
