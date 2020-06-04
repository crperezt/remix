import React, { Component } from 'react';


const PostTags = (props) => {
  let {tags} = props;
  let tagsText = [];
  if (tags) tags.forEach((v) => tagsText.push(v));
  return (
      <div className="postTags">
        {tagsText}
      </div>

    );
};

export default PostTags;