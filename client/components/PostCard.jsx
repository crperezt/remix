import React, { Component } from 'react';
import PostTags from './PostTags.jsx';

const PostCard = (props) => {
  let {title, postUrl, imageUrl, videoUrl, tags, postId} = props;
  let trimmedTitle = title.slice(0,80);
  if (trimmedTitle.length === 80) {
    trimmedTitle = trimmedTitle.slice(0, trimmedTitle.lastIndexOf(' '));
    trimmedTitle = trimmedTitle.concat('...');
  }
  
  return (
      <div className="postCard">
        <a className="postTitle" href={postUrl}>{trimmedTitle}</a>
        {imageUrl !== 'default' &&
          <img className="redditThumb" src={imageUrl}/>
        }
        <PostTags tags={tags}/>
      </div>

    );
};

export default PostCard;