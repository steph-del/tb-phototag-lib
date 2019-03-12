import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, mergeMap } from 'rxjs/operators';
import { PhotoTag } from '../_models/phototag.model';

@Injectable({
  providedIn: 'root'
})
export class TbPhototagLibService {

  baseApiUrl: string;
  apiPath = '/api/photo_tags';
  apiRelationPath = '/api/photo_photo_tag_relations';
  apiRetrievePath = '/api/photos/{id}/photo_tag_relations';

  public basicTags = [];

  usersTags: Array<PhotoTag> = [];

  constructor(private http: HttpClient) { }

  public setBasicTags(data: Array<PhotoTag>) {
    this.basicTags = data;
  }

  public setBaseApiUrl(data): void {
    this.baseApiUrl = data;
  }

  public setUsersTags(tags: Array<PhotoTag>): void {
    this.usersTags = tags;
  }

  getBasicTags(): Observable<Array<PhotoTag>> {
    return of(this.basicTags);
  }

  public getBasicTagsByPath() {
    const categories: Array<string> = this.getUniqueBasicTagsPaths();
    const response: any = [];
    let i = 0;
    categories.forEach(category => {
      response[i] = [];
      for (const bTag of this.basicTags) {
        if (bTag.path === category) {
          response[i].push(bTag);
        }
      }
      i++;
    });
    return of(response);
  }

  public getUniqueBasicTagsPaths() {
    const tagPaths: string[] = [];
    let i = 0;
    for (const tag of this.basicTags) {
      if (i === 0) {
        tagPaths.push(tag.path);
      } else {
        if (tagPaths.indexOf(tag.path) === -1) {
          tagPaths.push(tag.path);
        }
      }
      i++;
    }
    return tagPaths;
  }

  getUserTags(userId: number): Observable<Array<PhotoTag>> {
    // Call API and get user's tags
    return this.http.get(`${this.baseApiUrl}${this.apiPath}.json`).pipe(
      map(r => <Array<PhotoTag>>r),
      tap(r => this.setUsersTags(r))
    );
  }

  getPhotoTags(photoId: number): Observable<any> {
    const headers = {
      'content-type': 'application/ld+json',
      'accept': 'application/json'
    };

    return this.http.get(`${this.baseApiUrl}${this.apiRetrievePath.replace('{id', photoId.toString())}`, {headers})
    .pipe(
      map(results => results as Array<any>),
      map(results => {
        const tags = [];
        for (const result of results) {
          tags.push(result['photoTag']);
        }
        return of(tags);
      })
    );
  }

  removeTag(tag: PhotoTag): Observable<{success: boolean}> {
    // call API
    let i = 0;
    this.usersTags.forEach(_tag => {
      if (_tag.id === tag.id) {
        this.usersTags.splice(i, 1);
        return of({success: true });
      }
      i++;
    });
    return of({ success: false });
  }

  updateTag(tag: PhotoTag): Observable<any> {
    // update existing tag through API
    return this.http.patch(`${this.baseApiUrl}${this.apiPath}/${tag.id}`, {name: tag.name, path: tag.path});
  }

  /**
   * When a folder is renamed, all children tags must be updated
   */
  rewriteTagsPaths(path: string, newPath: string): void {
    this.usersTags.forEach(tagMayBeUpdated => {
      if (tagMayBeUpdated.path === path) {
        tagMayBeUpdated.path = newPath;
        this.updateTag(tagMayBeUpdated).subscribe(
          success => { /* cool */ },
          error => {
            // Can't do anything inside the service !
           }
        );
      }
    });
  }

  createTag(name: string, path: string, userId: number, photoId: number): Observable<any> {
    // Call API
    return this.http.post(`${this.baseApiUrl}${this.apiPath}`, {name: name, path: path, userId: userId});
  }

  linkTagToPhoto(tagId: number, photoId: number): Observable<any> {
    const headers = {
      'content-type': 'application/ld+json',
      'accept': 'application/json'
    };
    return this.http.post(`${this.baseApiUrl}${this.apiRelationPath}`, {'photo': `/api/photos/${photoId}`, 'photoTag': `/api/photo_tags/${tagId}`}, {headers});
  }

  unlinkTagToPhoto(tagId: number, photoId: number): Observable<any> {
    const headers = {
      'content-type': 'application/ld+json',
      'accept': 'application/json'
    };

    return this.http.get(`${this.baseApiUrl}${this.apiRetrievePath.replace('{id}', photoId.toString())}`, {headers})
      .pipe(
        map(r => r as Array<any>),
        map(r => {
          if (r.length > 0) {
            const relations = r;
            for (const relation of relations) {
              if (relation['photoTag']['id'] === tagId) {
                // We get the relation id between photoId and tagId
                return of(relation['id']);
              }
            }
          } else {
            // no relation found
            return of(null);
          }
        }),
        mergeMap(relationId => {
          if (relationId['value'] === null) {
            throw new Error;
          } else {
            return this.http.delete(`${this.baseApiUrl}${this.apiRelationPath}/${relationId['value']}`);
          }
        })
      );
  }
}
