import React, { Component } from 'react';
import PostTags from './PostTags.jsx';


const PostCard = (props) => {
  let {title, postUrl, imageUrl, videoUrl, tags, postId, addTag, showTagModal} = props;
  let trimmedTitle = title.slice(0,80);
  if (trimmedTitle.length === 80) {
    trimmedTitle = trimmedTitle.slice(0, trimmedTitle.lastIndexOf(' '));
    trimmedTitle = trimmedTitle.concat('...');
  }

  return (
      <div className="postCard">
        <a className="postTitle" href={postUrl}>{trimmedTitle} {postId}</a>
        {imageUrl !== 'default' &&
          <img className="redditThumb" src={imageUrl}/>
        }
        <div className="tagDiv">
          <img  id={'tag'+postId} 
                className="tagButton" 
                src='/assets/add-button-small.png' 
                onClick={showTagModal}/>
          <PostTags tags={tags}/>
        </div>
      </div>

    );
};

export default PostCard;