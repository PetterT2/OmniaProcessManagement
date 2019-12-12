//import { Store } from '@omnia/fx/store';
//import { Injectable, Inject, Topics, Utils, Localize } from '@omnia/fx';
//import { FormValidator, VueComponentBase } from '@omnia/fx/ux';
//import { InstanceLifetimes, IMessageBusSubscriptionHandler, GuidValue, Guid } from '@omnia/fx-models';
//import { ProcessEditingLink } from '../../models/processdesigner';
//import { IProcessDesignerItemFactory } from '../../processdesigner/designeritems';
//import { ProcessDesignerPanelStore } from './ProcessDesignerPanelStore';
//import { Link } from '../../fx/models';
//import { ProcessDesignerLocalization } from '../loc/localize';
//import { ProcessDesignerStore } from '.';

//@Injectable({
//    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
//})

//export class ProcessLinksStore extends Store {
//    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
//    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

//    /**
//     * State
//     */
//    private editingLink = this.state<ProcessEditingLink>(null);


//    constructor() {
//        super({ id: "a62f82b8-8c1a-46f9-9c95-84eb647c8e21" });
//    }

//    onActivated() {
//        if (!this.processDesignerStore.editingProcessReference.state.processData.links)//todo
//            this.processDesignerStore.editingProcessReference.state.processData.links = [];
//    }

//    onDisposing() {
//    }


//    getters = {
//        editingLink: () => {
//            if (!this.editingLink.state)
//                this.editingLink.mutate(this.initDefaultLink());
//            return this.editingLink.state;
//        }
//    }

//    /**
//     * Adds an item to the layout.
//     */
//    mutations = {
//        updateEditingLink: this.mutation((link: Link) => {
//            var isNew = this.editingLink.state.isNew;
//            this.editingLink.mutate({
//                link: link,
//                isNew: isNew
//            });
//        }),
//        editExistedLink: this.mutation((link: Link) => {
//            this.editingLink.mutate({
//                link: link,
//                isNew: false
//            });
//        })
//    }

//    actions = {
//        updateLink: this.action((link: Link) => {
//            return new Promise<null>((resolve, reject) => {
//                let links = this.processDesignerStore.editingProcessReference.state.processData.links;
//                let existedLink = links.find((item) => item.id == link);
//                if (existedLink) {
//                    existedLink = Utils.clone(link);
//                }
//                else {
//                    links.push(link);
//                }
//                this.mutations.updateEditingLink.commit(link);
//                resolve();
//            });
//        })
//    }

//    private initDefaultLink(): ProcessEditingLink {
//        let defaultLink: Link = {
//            id: Guid.newGuid(),
//            title: null,
//            url: '',
//            openNewWindow: false
//        };
//        return {
//            link: defaultLink,
//            isNew: true
//        };
//    }
//}