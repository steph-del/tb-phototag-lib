import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { Observable } from 'rxjs';

import { TbLog } from '../_models/tb-log.model';
import { PhotoTag } from '../_models/phototag.model';
import { TbPhototagLibService } from '../_services/tb-phototag-lib.service';
import { TreeService } from '../_services/tb-tree.service';

@Component({
  selector: 'tb-phototag',
  templateUrl: './tb-phototag.component.html',
  styleUrls: ['./tb-phototag.component.scss']
})
export class TbPhototagComponent implements OnInit {
  //
  // INPUT / OUTPUT
  //
  @Input() userId: number;
  @Input() photoId: number;
  @Input() baseApiUrl = 'http://localhost:8000';

  @Output() log = new EventEmitter<TbLog>();

  basicTags: Array<PhotoTag> = [];
  basicTagsByCategory: Array<Array<PhotoTag>> = [];
  userTags: Array<PhotoTag> = [];
  photoTags: Array<PhotoTag> = [];
  filteredUserTags: Observable<PhotoTag[]>;
  isLoadingBasicTags = false;
  isLoadingUsersTags = false;
  cantLoadUsersTags = false;
  showTree = false;

  constructor(
    private phototagService: TbPhototagLibService,
    private treeService: TreeService,
    private fb: FormBuilder) { }

  ngOnInit() {
    // photoId provided ?
    if (!this.photoId) {
      this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: 'Vous devez fournir un photoId pour initialiser le module'});
    }
    // Set baseApiUrl
    this.phototagService.setBaseApiUrl(this.baseApiUrl);
    // Set userId available
    this.treeService.setUserId(this.userId);

    // get photo tags
    this.phototagService.getPhotoTags(this.photoId).subscribe(
      result => {
        this.photoTags = result['value'];
      },
      error => console.log(error)
    );

    // Get tags
    this.getTags(this.userId);

  }

  /**
   * Get basic and user's tags
   */
  getTags(userId: number): void {
    this.userTags = [];
    // Get basic tags
    this.isLoadingBasicTags = true;
    this.phototagService.getBasicTags().subscribe(_tags => {
      this.log.emit({module: 'tb-phototag-lib', type: 'info', message_fr: `Les tags par défaut ont bien été chargés`});
      this.isLoadingBasicTags = false;
      this.basicTags = _tags;
    }, error => {
      this.isLoadingBasicTags = false;
      this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Les tags par défaut n'ont pas pu être chargés`});
    });

    this.phototagService.getBasicTagsByPath().subscribe(_tags => this.basicTagsByCategory = _tags);

    // Get user's tags
    this.isLoadingUsersTags = true;
    this.phototagService.getUserTags(userId).subscribe(_tags => {
      this.log.emit({module: 'tb-phototag-lib', type: 'info', message_fr: `Les tags utilisateurs ont bien été chargés`});
      this.isLoadingUsersTags = false;
      this.userTags = this.userTags.concat(_tags);
    }, error => {
      this.isLoadingUsersTags = false;
      this.cantLoadUsersTags = true;
      this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Les tags utilisateurs n'ont pas pu être chargés`});
    });
  }

  /**
   * When user select a tag, link it to the photo and emit the tag
   */
  linkTag(tag: PhotoTag): void {
    if (!this.basicTagAlreadyUsed(tag) || !this.userTagAlreadyUsed(tag)) {
      tag.pending = true;
      this.phototagService.linkTagToPhoto(tag.id, this.photoId).subscribe(
        success => {
          this.photoTags.push(tag);
          this.log.emit({module: 'tb-phototag-lib', type: 'success', message_fr: `Le tag "${tag.name}" est ajouté à votre photo`});
          tag.pending = false;
        },
        error => {
          tag.pending = false;
          this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Impossible de lier le tag "${tag.name}" à votre photo`});
        }
      );
    }
  }

  /**
   * When user unselect a tag, unlink it to the photo and emit the tag
   */
  unlinkTag(tag: PhotoTag): void {
    this.phototagService.unlinkTagToPhoto(tag.id, this.photoId).subscribe(
      success => {
        let i = 0;
        this.photoTags.forEach(photoTag => {
          if (photoTag.id === tag.id) { this.photoTags.splice(i, 1); }
          i++;
        });
      }, error => {
        this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Impossible de supprimer le lien entre le tag "${tag.name}" et votre photo`});
      }
    );
  }

  /**
   * When user select a basic tag, we create a new tag in db and then do the link
   */
  addBasicTag(tag: PhotoTag) {
    if (this.basicTagAlreadyUsed(tag)) { return; }
    tag.pending = true;
    tag.userId = this.userId;
    // is tag already exists ?
    let alreadyExistInDb = false;
    let tagToLink: PhotoTag = null;
    for (const uTag of this.userTags) {
      if (uTag.name === tag.name && uTag.path === tag.path) { alreadyExistInDb = true; tagToLink = uTag; }
    }

    if (alreadyExistInDb) {
      tag.pending = false;
      tagToLink.pending = true;
      // We only link the tag
      this.phototagService.linkTagToPhoto(tagToLink.id, this.photoId).subscribe (
        success => {
          this.photoTags.push(tagToLink);
          tagToLink.pending = false;
        }, error => {
          tagToLink.pending = false;
          this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Impossible de lier le tag "${tag.name}" à votre photo`});
        }
      );
    } else {
      // We first create the tag and the link it
      this.phototagService.createTag(tag.name, tag.path, tag.userId, this.photoId).subscribe(
        successTag => {
          tag.pending = false;
          successTag.pending = true;
          this.userTags.push(successTag);
          // link
          this.phototagService.linkTagToPhoto(successTag.id, this.photoId).subscribe(
            success => {
              this.photoTags.push(successTag);
              tag.pending = false;
              successTag.pending = false;
            },
            error => {
              successTag.pending = false;
              this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Impossible de lier le tag "${tag.name}" à votre photo`});
            }
          );
        }, error => {
          tag.pending = false;
          this.log.emit({module: 'tb-phototag-lib', type: 'error', message_fr: `Impossible de créer le tag "${tag.name}"`});
        }
      );
    }
  }

  toggleTree() {
    this.showTree = !this.showTree;
  }

  basicTagAlreadyUsed(tag: PhotoTag): boolean {
    if (this.photoTags.length > 0) {
      for (const _tag of this.photoTags) {
        if (tag.name === _tag.name && tag.path === _tag.path) { return true; }
      }
    }
    return false;
  }

  userTagAlreadyUsed(tag: PhotoTag): boolean {
    if (this.photoTags.length > 0) {
      for (const _tag of this.photoTags) {
        if (tag.id === _tag.id) { return true; }
      }
    }
    return false;
  }

  getColor(tag: PhotoTag) {
    if (this.basicTagAlreadyUsed(tag)) {
      return 'primary';
    } else {
      return 'none';
    }
  }

  /**
   * Bind phototag-tree logs
   */
  _log(logMessage: TbLog) {
    this.log.emit(logMessage);
  }

}
